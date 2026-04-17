import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { responseTime } from 'response-time';
import { Request, Response } from 'express';
import { LoggerPrint } from './logger/logger.print';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  restResponseTimeHistogram,
  totalRequestConter,
  httpRequestSizeBytes,
  httpResponseSizeBytes,
} from './prometheus-chatapp/prometheus-chatapp.exporters';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerPrint);
  if (process.env.NODE_ENV !== 'production') app.useLogger(logger);

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
  });

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Real-time Chat Sky Track')
    .setDescription('For authentication, token has to be sent by headers as **token** variable name')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addServer('chat-server', {
      url: 'ws://localhost:3001/chat-message',
      protocol: 'socket.io',
    })
    .build();

  const config = new DocumentBuilder()
    .setTitle('Chat swagger documentation')
    .setVersion('0.1')
    .setDescription('')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  /*   app.enableCors({
    origin: ['https://amritb.github.io'],
    credentials: true,
  }); */

  const document = SwaggerModule.createDocument(app, config);
  const asyncapiDocument = AsyncApiModule.createDocument(app, asyncApiOptions);

  await AsyncApiModule.setup('asyncapi', app, asyncapiDocument);
  SwaggerModule.setup('/field-docs', app, document);

  await app.listen(3001);

  /*app.use((req: Request, res: Response, next) => {
      const requestSize = parseInt(req.get('content-length') || '0', 10);
      res.on('finish', () => {
        httpRequestSizeBytes.observe(
          {
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode.toString(),
          },
          requestSize,
        );
      });
  
      next();
    }); 

  app.use((req: Request, res: Response, next) => {
      let responseSize = 0;
      const originalWrite = res.write;
      const originalEnd = res.end;
  
      res.write = function (chunk: any, ...args: any[]) {
        if (chunk) {
          responseSize += Buffer.byteLength(chunk);
        }
        return originalWrite.apply(res, [chunk, ...args]);
      };
  
      res.end = function (chunk: any, ...args: any[]) {
        if (chunk) {
          responseSize += Buffer.byteLength(chunk);
        }
  
        res.on('finish', () => {
          httpResponseSizeBytes.observe(
            {
              method: req.method,
              route: req.route?.path || req.path,
              status: res.statusCode.toString(),
            },
            responseSize,
          );
        });
  
        return originalEnd.apply(res, [chunk, ...args]);
      };
  
      next();
    });*/

}

bootstrap()