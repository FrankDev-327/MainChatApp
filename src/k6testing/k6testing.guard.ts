import { Request } from 'express';
import { LoggerPrint } from '../logger/logger.print';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class K6testingGuard implements CanActivate {
  constructor(private readonly loggerPrint: LoggerPrint,) {
    this.loggerPrint = new LoggerPrint(K6testingGuard.name)
  }

  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    try {
      if (!token) {
        throw new UnauthorizedException("No Authorizated!");
      }

      if (token !== process.env.K6_TOKEN_TESTING) {
        throw new UnauthorizedException("No Authorizated!");
      }

    } catch (error) {
      this.loggerPrint.error("No Authorizated!", error.message);
      throw new UnauthorizedException("No Authorizated!");
    }

    return Promise.resolve(true);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
