import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoggerPrint } from '../logger/logger.print';

@Injectable()
export class CheckTokenGuard implements CanActivate {
  constructor(
    private readonly loggerPrint: LoggerPrint,
    private readonly jwtService: JwtService
  ) {
    this.loggerPrint = new LoggerPrint(CheckTokenGuard.name)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.loggerPrint.error("No Authorizated!");
      throw new UnauthorizedException("No Authorizated!");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.KEY_SECRET,
      });

      request.user = payload;
    } catch (error) {
      this.loggerPrint.error(error);
      throw new UnauthorizedException("No Authorizated!");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
