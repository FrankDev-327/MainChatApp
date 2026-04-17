import { faker } from '@faker-js/faker';
import { ReceiveLocationDto } from '../../../dto/nominative/receive.location.dto';
import { MessageType } from '../../../dto/chat.private.message/create.private.message.dto';

faker.seed(123456);

export function generateReceiveLocationDto(overrides = {}) {
  const receiveLocationDto: ReceiveLocationDto = {
    lat: faker.location.latitude().toString(),
    lon: faker.location.longitude().toString(),
    group_id: faker.number.int({ min: 1, max: 1000 }),
    sender_id: faker.number.int({ min: 1, max: 1000 }),
    receiver_id: faker.number.int({ min: 1, max: 1000 }),
    message_type: MessageType.TEXT,
    taskId: faker.number.int({ min: 1, max: 1000 }),
  };

  return receiveLocationDto;
}
