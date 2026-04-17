import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from '../dto/auth/login.dto';
import { AuthenticationService } from './authentication.service';
import {
    ApiTags,
    ApiBadRequestResponse,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';
import { ResponseAuthLogin } from '../dto/auth/response.logi.dto';

@ApiTags('Auth')
@Controller('authentication')
export class AuthenticationController {
    constructor(private authenticationService: AuthenticationService) { }

    @Post('login')
    @ApiOperation({ summary: 'User autentication' })
    @ApiOkResponse({ type: ResponseAuthLogin })
    @ApiBadRequestResponse({
        description: 'The user name or password are wrong. Try again.',
    })
    async login(@Body() body: LoginUserDto) {
        return this.authenticationService.validateUser(body);
    }
}
