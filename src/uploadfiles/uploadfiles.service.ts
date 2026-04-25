import 'multer';
import * as Minio from 'minio';
import { LoggerPrint } from '../logger/logger.print';
import { Injectable } from '@nestjs/common';
import {
  restResponseTimeHistogram,
  totalRequestConter,
} from '../prometheus-chatapp/prometheus-chatapp.exporters';
import { ChatPrivateMessagesService } from '../chat-private-messages/chat-private-messages.service';
import { CreateMessageTaskDto } from '../dto/chat.private.message/create.private.message.dto';

@Injectable()
export class UploadfilesService {
  private bucketName: string;
  private minioClient: Minio.Client

  constructor(
    private readonly loggerPrint: LoggerPrint,
    private readonly chatPrivateMessagesService: ChatPrivateMessagesService,
  ) {

    this.minioClient = new Minio.Client({
      endPoint: process.env.FIELD_HUB_BUCKET_URL_CHAT,
      useSSL: true,
      accessKey: process.env.FIELD_HUB_BUCKET_ACCESS_KEY,
      secretKey: process.env.FIELD_HUB_BUCKET_SECRET_KEY,
    });
    this.bucketName = process.env.FIELD_HUB_BUCKET_NAME;
  }

  async uploadBase64(file: Express.Multer.File, dto: any): Promise<void> {
    const time = restResponseTimeHistogram.startTimer();
    try {
      this.loggerPrint.log(`File name of this file is : ${file.originalname}`);
      const name = `${Date.now()}-${file?.originalname}`;
      const rootDir = `${process.env.FIELD_HUB_ROOT_DIR}/${this.bucketName}/${dto.taskId}/${name}`;
      await this.minioClient.putObject(
        this.bucketName,
        rootDir,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );

      const urlFile = await this.getFileUrl(file?.originalname);
      time({
        method: 'POST',
        route: 'uploadfiles',
        status: 200,
      });
      const messageDto: CreateMessageTaskDto = {
        sender_id: dto.sender_id,
        receiver_id: !dto?.group_id ? dto.receiver_id : 0,
        group_id: dto.group_id ?? 0,
        taskId: !dto?.group_id ? 0 : dto.taskId,
        message_type: dto.message_type,
        message: '',
        is_urgent: dto.is_urgent,
        is_notification: dto.is_notification,
        lat: dto.lat,
        lon: dto.lon,
        lonCoodinate: '',
        latCoodinate: '',
        file: urlFile || '',
        position: '',
      };

      await this.chatPrivateMessagesService.createNewPrivateMessage(messageDto);
    } catch (error) {
      totalRequestConter.inc({
        method: 'POST',
        route: 'uploadfiles',
        status: 500,
      });
      this.loggerPrint.error('Error uploading base64 to MinIO:', error);
    }
  }

  async getFileUrl(fileName: string): Promise<string | null> {
    try {
      if(fileName === "" || fileName == null) return null;
      const fileInfo = await this.minioClient.presignedUrl(
        'GET',
        this.bucketName,
        fileName,
        1200,
      );
      return fileInfo;
    } catch (error) {
      totalRequestConter.inc({
        method: 'GET',
        route: 'getFileUrl',
        status: 500,
      });
      this.loggerPrint.error(
        `Error getting file from Minio bucket ${error}`,
      );

      return null;
    }
  }
}
