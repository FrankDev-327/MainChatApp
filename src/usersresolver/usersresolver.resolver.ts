import { ChatTaskEntity } from '../entities/chatt.tasks.entity';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChatTasksService } from '../chat-tasks/chat-tasks.service';
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver(() => UserEntity)
export class UsersresolverResolver {
  constructor(private readonly usersService: UsersService,
    private readonly chatTasksService: ChatTasksService
  ) { }

  @Query(() => UserEntity, { name: 'userName', nullable: false })
  async findOne(@Args('userName', { type: () => String }) userName: string): Promise<UserEntity | null> {
    return this.usersService.findUserByUserName(userName);
  }

  @Query(() => [ChatTaskEntity])
  async tasks(@Args('userId', { type: () => Number }) userId: number): Promise<ChatTaskEntity[]> {
    return await this.chatTasksService.findByUserId(userId);
  }
}
