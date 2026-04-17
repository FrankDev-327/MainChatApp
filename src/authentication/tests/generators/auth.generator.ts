import { faker } from '@faker-js/faker';
import { LoginUserDto } from '../../../dto/auth/login.dto';
faker.seed(123456);

export function generateAuthData(override = {}) {
    return {
        userName: faker.person.firstName(),
        password: faker.internet.password(),
        checkTypeAuth: "",
        ...override,
    };
}

export function useIntegrationAndE2EUserLogin(): LoginUserDto {
    const userCredential: LoginUserDto = {
        "userName": "artadmin",
        "password": "juricaperica",
        "checkTypeAuth": ""
    }

    return userCredential;
}

export function generateTokenData() {
    return {
        token:
            'eyJzdWIiOiAiMTIzNDU2Nzg5MCIsICJuYW1lIjogIkpvaG4gRG9lIiwgImlhdCI6IDE1MTYyMzkwMjJ9',
    };
}