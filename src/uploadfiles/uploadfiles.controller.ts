import { UploadfilesService } from './uploadfiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CheckTokenGuard } from '../check.token/check.token.guard';
import { Body, Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('uploadfiles')
export class UploadfilesController {
    constructor(private readonly uploadfilesService: UploadfilesService) { }

    @ApiOperation({ summary: 'Insert a file - By sending: sender_id|receiver_id the data the response from this endpoint will be sent to direct|direct-task socket message but if group_id is sent socket data response will be sent to group-message' })
    @ApiOkResponse()
    @ApiBearerAuth('JWT-auth')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                sender_id: {
                    type: 'number',
                },
                receiver_id: {
                    type: 'number',
                },
                group_id: {
                    type: 'number',
                },
                message_type: {
                    type: 'string',
                },
                is_notification: {
                    type: 'boolean',
                },
            },
            required: ['file', 'sender_id', 'message_type'],
        },
    })
    @UseGuards(CheckTokenGuard)
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadBase64(@Body() dto: any, @UploadedFile() file: Express.Multer.File) {
        return await this.uploadfilesService.uploadBase64(file, dto);
    }
}