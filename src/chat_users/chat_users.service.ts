import { Repository } from 'typeorm';
import { LoggerPrint } from '../logger/logger.print';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from '../dto/auth/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUser } from '../entities/chat.users.entity';

@Injectable()
export class ChatUsersService {
  constructor(
    @InjectRepository(ChatUser)
    private chatUsersRepository: Repository<ChatUser>,
    private loggerPrint: LoggerPrint,
  ) {}

  async findByUserName(dto: LoginUserDto): Promise<ChatUser | any | null> {
    try {
      const passwordFunction =
        process.env.PASSWORD_VERSION !== 'OLD_VERSION'
          ? 'PASSWORD(?)'
          : 'OLD_PASSWORD(?)';

      const query = `
    SELECT u.UserID, LOWER(u.UserName) AS UserName, u.UserGroupID, ugp.ObjectPriv,
           ugp.ZonePriv, ugp.CarPriv, ugp.DrivePriv, u.UserPassword, u.IsAdmin
    FROM chat_users u
    INNER JOIN usergroups ugp ON ugp.UserGroupID = u.UserGroupID
    WHERE u.UserName = ?
      AND u.UserPassword = ${passwordFunction}
  `;

      const rawQuery = await this.chatUsersRepository.query(query, [
        dto.userName,
        dto.password,
      ]);

      return rawQuery?.length > 0 ? rawQuery[0] : null;
    } catch (error) {
      this.loggerPrint.error(`Error fetching chat user by username: ${error}`);
      throw new BadRequestException(error.message);
    }
  }
}
