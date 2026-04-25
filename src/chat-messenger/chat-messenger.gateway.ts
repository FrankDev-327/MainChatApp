import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { LoggerPrint } from '../logger/logger.print';
import { TokenService } from '../token/token.service';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { RedisUtilsService } from '../redis-utils/redis-utils.service';
import { Socket, Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import {
  totalSocketCounter,
  totalMessagesConter,
} from '../prometheus-chatapp/prometheus-chatapp.exporters';
import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import { restResponseTimeHistogram } from '../prometheus-chatapp/prometheus-chatapp.exporters';
import { ChatPrivateMessagesService } from '../chat-private-messages/chat-private-messages.service';
import { SendGroupMessageWithEntryPointDto } from '../dto/chat.socket.messages/entry.message.point.dto';
import { SendPrivateTaskMessageDto } from '../dto/chat.socket.messages/task.entry,message.dto';
import { SendGroupMessageResponseDto } from '../dto/chat.socket.messages/group.emit.message.dto';
import { PrivateMessageResponseDto } from '../dto/chat.socket.messages/directo.emit.message.dto';
//import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@WebSocketGateway({
  namespace: 'chat-message',
  cors: {
    origin: '*',
  },
})
export class ChatMessengerGateway
  implements
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnModuleInit {
  @WebSocketServer()
  server: Server;
  private socketUserClients = new Map<number, Socket>();

  constructor(
    private jwtService: JwtService,
    private loggerPrint: LoggerPrint,
    private tokenService: TokenService,
    private redisUtilsService: RedisUtilsService,
    private chatPrivateMessagesService: ChatPrivateMessagesService,
  ) { }

  afterInit(server: Server) {
    this.loggerPrint.log(
      `WebSocket server initialized ${new Date().toISOString()}`,
    );
  }

  onModuleInit() {
    this.loggerPrint.log('ChatMessengerGateway module initialized');
  }

  async handleDisconnect(client: Socket) {
    this.loggerPrint.warn(`Client disconnected: ${client.id}`);
    const userInfo = await this.redisUtilsService.getListHash(
      `user-socket-info-${client.id}`,
    );

    if (userInfo?.userId) this.socketUserClients.delete(userInfo?.userId);
    if (userInfo?.group_id)
      this.server.socketsLeave(`group-room-${userInfo?.group_id}`);

    const keysToDelete = [
      `user-info-${userInfo?.userId}`,
      `user-socket-info-${client.id}`,
      `user-token-${client.id}`,
      `user:${userInfo?.userId}`
    ];
    await this.redisUtilsService.deleteSetDataByKeyName(keysToDelete);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const queryHandShake = client.handshake.headers;
      const token = queryHandShake.token as string;

      if (!token) {
        this.loggerPrint.log(
          `Client ${client.id} disconnected due to missing token`,
        );
        this.loggerPrint.error(`Token not provided by client ${client.id}`);
        totalSocketCounter.inc({
          method: 'handle-token',
          route: 'errot-socket-connecton',
        });
        throw new WsException('Invalid token.');
      }

      const tokenExists = await this.tokenService.getTokenByUserId(token);
      if (!tokenExists) {
        this.loggerPrint.log(
          `Client ${client.id} disconnected due to invalid token`,
        );
        this.loggerPrint.error(`Token not provided by client ${client.id}`);
        totalSocketCounter.inc({
          method: 'handle-token',
          route: 'errot-socket-connecton',
        });
        throw new WsException('Invalid token.');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.KEY_SECRET,
      });

      this.loggerPrint.log(
        `Token payload for client ${client.id}: ${JSON.stringify(payload)}`,
      );

      this.socketUserClients.set(payload.userId, client);
      this.loggerPrint.log(`Client connected: ${client.id}`);
      //if (payload.isAdmin === 'N') {
      client.join(`group-room-${payload.userGroupId}`);
      this.loggerPrint.log(
        `Client ${client.id} joined room: ${payload.userGroupId}`,
      );
      //}

      const onlineUser = "users-online";
      const userInfo = `user-info-${payload.userId}`;
      const userSocketInfo = `user-socket-info-${client.id}`;
      const userToken = `user-token-${client.id}`;
      const userOnline = {
        userName: payload.userName,
        userId: payload.userId,
        onlineStatus: true,
      };

      await Promise.all([
        this.redisUtilsService.setHashExpireTimeOrNot(userToken, token),
        this.redisUtilsService.setHashExpireTimeOrNot(userInfo, payload),
        this.redisUtilsService.addMembers(onlineUser, userOnline),
        this.redisUtilsService.setHashExpireTimeOrNot(userSocketInfo, payload),
      ]);

      totalSocketCounter.inc({
        method: 'handle-connection',
        route: 'socket-connecton',
      });
    } catch (error) {
      this.loggerPrint.error(
        `Connection error for client ${client.id} : ${error}`,
      );
      totalSocketCounter.inc({
        method: 'handle-token',
        route: 'errot-socket-connecton',
      });
      throw new WsException('Invalid token.');
    }
  }

  @SubscribeMessage('join-group')
  async handleJoinGroup(client: Socket, payload: any) {
    client.join(`group-room-${payload.group_id}`);
    const info = await this.redisUtilsService.getListHash(
      `user-socket-info-${client.id}`,
    );
    this.server.to(`group-room-${payload.group_id}`).emit('group-message', {
      message: `User ${info.userName} has joined the group.`,
    });
  }

  async handleOnlineUsers(): Promise<any> {
    const keyName = "users-online";
    const onlineUsers = await this.redisUtilsService.getAllAddedMembers(keyName);

    return JSON.parse(onlineUsers);
  }

  @SubscribeMessage('entry-message')
  @AsyncApiPub({
    channel: 'entry-message',
    summary: 'Entry point for every single socket event - (messageClient to server)',
    message: { payload: SendGroupMessageWithEntryPointDto },
  })
  async handleMessage(client: Socket, payload: any): Promise<boolean> {
    await this.chatPrivateMessagesService.createNewPrivateMessage(payload);
    return true;
  }


  @SubscribeMessage('task-message')
  @AsyncApiPub({
    channel: 'task-message',
    summary: 'Entry point for every task assigned to specific driver - (messageClient to server)',
    message: { payload: SendPrivateTaskMessageDto },
  })
  async handleTaskMessage(client: Socket, payload: any): Promise<boolean> {
    await this.chatPrivateMessagesService.createNewPrivateMessage(payload);
    return true;
  }

  @OnEvent('chat.message.created', { async: true })
  async handleMessageCreatedEvent(payload: any): Promise<boolean> {
    await this.redisUtilsService.publishingMessage(
      'notification_channel',
      payload,
    );

    if (payload.typeSendCoordinates === 'GROUP') {
      await this.handleGroupMessage(payload);
      return true;
    }

    if (payload.typeSendCoordinates === 'PRIVATE') {
      if (payload?.taskId != null) {
        await this.handleTaskDirectMessage(payload);
        return true;
      }
      await this.handleDirectMessage(payload);
      return true;
    }
  }

  @AsyncApiSub({
    channel: 'direct-task-message-TASKID',
    summary: 'Receive message from server - **TASKID** represent taskId concated to the string **direct-task-message-3**',
    message: { payload: PrivateMessageResponseDto },
  })
  async handleTaskDirectMessage(payload): Promise<void> {
    let timerDatabaseRepsonse;
    const channel = `direct-task-message-${payload.taskId}`;
    if (Object.keys(payload?.position).length > 0) payload.position = JSON.parse(payload?.position);
    timerDatabaseRepsonse = restResponseTimeHistogram.startTimer();
    const reveiverClientSocket = this.socketUserClients.get(
      Number(payload.chatUserIds.receiverId),
    );

    totalMessagesConter.inc({ method: channel });
    const senderClientSocket = this.socketUserClients.get(
      Number(payload.chatUserIds.senderId),
    );

    timerDatabaseRepsonse({
      method: 'chat.message.created',
      route: channel,
      status: 200,
    });

    const messageAck = {
      type: "message",
      action: "create_ack",
      timestamp: payload.createdAt,
      client_id: payload.chatUserIds.receiverId,
      message_server_id: payload.messageId,
      attachments: []
    }

    totalMessagesConter.inc({ method: channel });

    //TODO this message should be sent first
    senderClientSocket?.emit(channel, messageAck);
    reveiverClientSocket?.emit(channel, payload);
    senderClientSocket?.emit(channel, payload);
  }

  @AsyncApiSub({
    channel: 'direct-message',
    summary: 'Receive message from server',
    message: { payload: PrivateMessageResponseDto },
  })
  async handleDirectMessage(payload): Promise<void> {
    let timerDatabaseRepsonse, channel = 'direct-message';
    timerDatabaseRepsonse = restResponseTimeHistogram.startTimer();
    if (Object.keys(payload?.position).length > 0) payload.position = JSON.parse(payload?.position);
    const reveiverClientSocket = this.socketUserClients.get(
      Number(payload.chatUserIds.receiverId),
    );

    totalMessagesConter.inc({ method: channel });
    const senderClientSocket = this.socketUserClients.get(
      Number(payload.chatUserIds.senderId),
    );

    timerDatabaseRepsonse({
      method: 'chat.message.created',
      route: channel,
      status: 200,
    });

    const messageAck = {
      type: "message",
      action: "create_ack",
      timestamp: payload.createdAt,
      client_id: payload.chatUserIds.receiverId,
      message_server_id: payload.messageId,
      attachments: []
    }

    totalMessagesConter.inc({ method: channel });

    //TODO this message should be sent first
    senderClientSocket?.emit(channel, messageAck);
    reveiverClientSocket?.emit(channel, payload);
    senderClientSocket?.emit(channel, payload);
  }

  @AsyncApiSub({
    channel: 'group-message',
    summary: 'Receive message from server',
    message: { payload: SendGroupMessageResponseDto },
  })
  async handleGroupMessage(payload): Promise<void> {
    let timerDatabaseRepsonse;
    if (Object.keys(payload?.position).length > 0) payload.position = JSON.parse(payload?.position);
    timerDatabaseRepsonse = restResponseTimeHistogram.startTimer();
    const userInfo = JSON.parse(
      await this.redisUtilsService.getValueByKeyName(
        `user-info-${Number(payload.chatUserIds.senderId)}`,
      ),
    );

    payload.senderName = userInfo?.userName ?? 'Name was not assigned';
    totalMessagesConter.inc({ method: `group-room-${payload.groupId}` });
    timerDatabaseRepsonse({
      method: 'chat.message.created',
      route: `group-room-${payload.groupId}`,
      status: 200,
    });
    this.server
      .to(`group-room-${payload.groupId}`)
      .emit('group-message', payload);

  }

  /*@RabbitSubscribe({
    exchange: 'task.assigned',
    routingKey: 'task-assigned-route',
    queue: 'task-assigned-queue',
  })
  async sendingTaskToAssigned(taskBody: any): Promise<void> {
    const privateClient = this.socketUserClients[taskBody.receiverId]
    if (privateClient) {
      privateClient.emit('notification', taskBody);
    }
  }*/
}
