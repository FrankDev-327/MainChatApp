import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum PermissionType {
    READ = 'read',
    WRITE = 'write',
    VIEW_GROUP = 'view_group',
    ASSIGN_TASK = 'assign_task',
    SEND_GROUP_MESSAGE = 'send_group_message',
}

@Entity({ name: 'user_group_rights' })
export class ChatUserGroupRightEntity {
    @PrimaryGeneratedColumn({ name: 'right_id' })
    rightId: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'group_id' })
    groupId: number;

    @Column({
        type: 'enum',
        enum: PermissionType,
        name: 'permission_type',
    })
    permissionType: PermissionType;

    @Column({ type: 'boolean', default: false, name: 'is_granted' })
    isGranted: boolean;
}
