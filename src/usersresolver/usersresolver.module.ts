import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ChatTasksModule } from '../chat-tasks/chat-tasks.module';
import { UsersresolverResolver } from './usersresolver.resolver';

@Module({
    imports: [UsersModule, ChatTasksModule],
    providers: [UsersresolverResolver],
    exports: [UsersresolverResolver],
})
export class UsersresolverModule { }
