import { Module, Global } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Global()
@Module({
    imports: [
        RabbitMQModule.forRoot({
            exchanges: [
                {
                    name: 'task.assigned',
                    type: 'topic',
                },
            ],
            uri: `amqp://${process.env.RABBIT_MQ_USER}:${process.env.RABBIT_MQ_PASSWORD}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_PORT}`,
            connectionInitOptions: { wait: false },
        }),
    ],
    exports: [RabbitMQModule],
})
export class RabbitTaskModule { }
