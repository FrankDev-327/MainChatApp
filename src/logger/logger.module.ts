import { Global, Module } from '@nestjs/common';
import { LoggerPrint } from './logger.print';

@Global()
@Module({
    imports: [],
    providers: [
        {
            provide: LoggerPrint,
            useFactory: () => {
                const fileCustomName = 'application'; // You can set this dynamically or retrieve from config
                return new LoggerPrint(fileCustomName);
            },
        },
    ],
    exports: [LoggerPrint],
})
export class LoggerModule { }
