import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatUserGroupRightEntity } from '../entities/chat.user.rights.entity';
import { CreateUserGroupRightDto } from '../dto/chat.users.rights/create.chat.users.rights.dto';

@Injectable()
export class ChatUserRightsService {
    constructor(
        @InjectRepository(ChatUserGroupRightEntity)
        private chatUserGroupRightRepository: Repository<ChatUserGroupRightEntity>,
    ) { }

    async setUserGroupRight(dto: CreateUserGroupRightDto): Promise<ChatUserGroupRightEntity> {
        try {
            const right = {
                userId: dto.userId,
                groupId: dto.groupId,
                permissionType: dto.permissionType,
                isGranted: dto.isGranted,
            };

            const rightData = this.chatUserGroupRightRepository.create(right);
            return this.chatUserGroupRightRepository.save(rightData);
        } catch (error) {
            return {} as ChatUserGroupRightEntity;
        }
    }

    async listUserGroupRights(): Promise<ChatUserGroupRightEntity[]> {
        return this.chatUserGroupRightRepository.find();
    }

    async listingPermissionByUserIdAndGroupId(dto): Promise<ChatUserGroupRightEntity[]> {
        return this.chatUserGroupRightRepository.find({
            where: {
                userId: dto.userId,
                groupId: dto.groupId,
            },
        });
    }
}