import { PartialType } from '@nestjs/mapped-types';
import { CreateChatUserDto } from './create.user.dto';

export class UpdateChatUserDto extends PartialType(CreateChatUserDto) {}