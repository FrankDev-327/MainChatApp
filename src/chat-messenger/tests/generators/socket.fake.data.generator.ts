import { faker } from '@faker-js/faker';
faker.seed(4);

export function generatetestMessageNoGroupId(override = {}) {
  return {
    message: faker.lorem.paragraph,
    //"group_id": 1,
    sender_id: faker.number.int({ min: 10, max: 100 }),
    receiver_id: faker.number.int({ min: 10, max: 100 }),
    taskId: faker.number.int({ min: 10, max: 100 }),
    parentTaskId: faker.number.int({ min: 10, max: 100 }),
    status: 'assigned',
    shipmentId: 'SHIP-20250625-001',
    taskType: 'simple',
    is_urgent: faker.number.int({ min: 0, max: 1 }),
    message_type: 'TEXT',
    is_notification: faker.number.int({ min: 0, max: 1 }),
    lon: faker.location
      .longitude({ max: 10, min: -10, precision: 5 })
      .toString(),
    lat: faker.location
      .latitude({ max: 10, min: -10, precision: 5 })
      .toString(),
    lonCoodinate: faker.location
      .longitude({ max: 10, min: -10, precision: 5 })
      .toString(),
    latCoodinate: faker.location
      .latitude({ max: 10, min: -10, precision: 5 })
      .toString(),
  };
}

export function generateTestMessageGroupId(override = {}) {
  return {
    message: faker.lorem.paragraph,
    group_id: faker.number.int({ min: 10, max: 100 }),
    sender_id: faker.number.int({ min: 10, max: 100 }),
    receiver_id: faker.number.int({ min: 10, max: 100 }),
    taskId: faker.number.int({ min: 10, max: 100 }),
    parentTaskId: faker.number.int({ min: 10, max: 100 }),
    status: 'assigned',
    shipmentId: 'SHIP-20250625-001',
    taskType: 'simple',
    is_urgent: faker.number.int({ min: 0, max: 1 }),
    message_type: 'TEXT',
    is_notification: faker.number.int({ min: 0, max: 1 }),
    lon: faker.location
      .longitude({ max: 10, min: -10, precision: 5 })
      .toString(),
    lat: faker.location
      .latitude({ max: 10, min: -10, precision: 5 })
      .toString(),
    lonCoodinate: faker.location
      .longitude({ max: 10, min: -10, precision: 5 })
      .toString(),
    latCoodinate: faker.location
      .latitude({ max: 10, min: -10, precision: 5 })
      .toString(),
  };
}
