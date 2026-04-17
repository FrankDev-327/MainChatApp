import { faker } from '@faker-js/faker';
import { CreateTokenDto } from '../../../dto/token/create.token.dto';
faker.seed(12345);

export function generateTokenUnitTest(override = {}) {
  const token: CreateTokenDto = {
    userId: faker.number.int({ min: 1, max: 1000 }),
    token: faker.word
      .words({ count: { min: 20, max: 80 } })
      .replace(/\s+/g, '-')
      .toLowerCase(),
  };

  return token;
}

export function generateFakeToken() {
  return faker.word
    .words({ count: { min: 20, max: 80 } })
    .replace(/\s+/g, '-')
    .toLowerCase();
}
