import { faker } from '@faker-js/faker';
import { LoginUserDto } from '../../../dto/auth/login.dto';
faker.seed(123456);

export function generateChatUser(override = {}) {
  const loginDto: LoginUserDto = {
    email: faker.person.firstName(),
    password: faker.internet.password(),
    checkTypeAuth: ''
  };

  return loginDto;
}

export function useIntegrationAndE2EUserChatUser() {
  return {
    userName: 'artadmin',
    password: 'juricaperica',
    checkTypeAuth: '',
  };
}
