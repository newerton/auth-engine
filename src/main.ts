import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['host.docker.internal:9094'],
        },
        consumer: {
          groupId: 'auth-consumer',
          allowAutoTopicCreation: true,
        },
      },
    },
  );
  await app.listen(() => logger.log('auth-engine is running'));
}
bootstrap();
