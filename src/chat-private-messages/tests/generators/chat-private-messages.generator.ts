import { faker }  from '@faker-js/faker';
import { CreateMessageTaskDto, MessageType } from '../../../dto/chat.private.message/create.private.message.dto'

export function generateFakeChatMessage(override = {}) {
    const chatMessageDto : CreateMessageTaskDto = {
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