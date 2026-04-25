import { JwtService } from '@nestjs/jwt';
import { CreateTokenDto } from '../dto/token/create.token.dto';
import { TokenService } from '../token/token.service';
import { LoginUserDto } from '../dto/auth/login.dto';
import { LoggerPrint } from '../logger/logger.print';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatUsersService } from '../chat_users/chat_users.service';
import { databaseResponseTimeHistogram, totalRequestConter } from '../prometheus-chatapp/prometheus-chatapp.exporters';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly chatUsersService: ChatUsersService,
        private readonly jwtService: JwtService,
        private readonly loggerPrint: LoggerPrint,
    ) { }

    async validateUser(dto: LoginUserDto) {
        const timer = databaseResponseTimeHistogram.startTimer();
        try {            
            const user = await this.chatUsersService.findByUserName(dto);
            if (!user) {
                totalRequestConter.inc({ method: 'POST', route: '/authentication', status: '400' });
                this.loggerPrint.warn('User not found with the provided username.');
                throw new NotFoundException('The user name or password are wrong. Try again.');
            }

            const tokenGenerated = await this.jwtService.sign({
                userId: user.UserID,
                userName: user.UserName,
                userGroupId: user.UserGroupID,
                drivePriv: user.DrivePriv,
                userCarPriv: user.CarPriv,
                userObjPriv: user.ObjectPriv,
                userZonePriv: user.ZonePriv,
                isAdmin: user.IsAdmin
            });

            const tokenToInsert: CreateTokenDto = {
                userId: user.UserID,
                token: tokenGenerated,
            };

            await this.tokenService.createToken(tokenToInsert);
            timer({ method: 'POST', route: '/authentication', status: '200' });
            return { token: tokenGenerated }
        } catch (error) {
            totalRequestConter.inc({ method: 'POST', route: '/authentication', status: '500' });
            this.loggerPrint.error(`Error during user validation: ${error}`);
            if (error instanceof NotFoundException) {
                this.loggerPrint.error(error.message);
                throw new NotFoundException(error.message);
            }

            this.loggerPrint.error(error);
            throw new BadRequestException('Token generation failed.');
        }
    }
}
