import { faker } from '@faker-js/faker';
import { Readable } from 'stream';
import { CreateMessageTaskDto, MessageType } from '../../../dto/chat.private.message/create.private.message.dto'

export function generateFakeUploadFileMessage(override = {}) {
    const chatMessageDto: CreateMessageTaskDto = {
        sender_id: faker.number.int({ min: 1, max: 10 }),
        receiver_id: faker.number.int({ min: 1, max: 10 }),
        group_id: faker.number.int({ min: 1, max: 10 }),
        taskId: faker.number.int({ min: 1, max: 10 }),
        message: faker.string.alpha(10),
        message_type: MessageType.COORDINATES,
        is_urgent: faker.number.int({ min: 0, max: 1 }),
        is_notification: faker.number.int({ min: 0, max: 1 }),
        position: "",
        file: "",
        lon: '',
        lonCoodinate: '',
        latCoodinate: '',
        lat: ''
    }

    return chatMessageDto;
}

export function generateFakeFileMetaData() {
    const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('%PDF-1.4 fake pdf content'),
        destination: '/uploads',
        filename: 'document-123.pdf',
        path: '/uploads/document-123.pdf',
        stream: new Readable(),
    }

    return file;
}