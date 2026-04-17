import { faker } from '@faker-js/faker';
faker.seed(12345);

export function generateChatDriverId(override = {}) {
  return faker.number.int({ min: 1, max: 1000 });
}

