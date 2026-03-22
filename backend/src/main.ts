import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from '@/app.module';
import { appConfig } from '@/shared/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: appConfig.logLevel,
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors({
    credentials: true,
    origin: appConfig.frontendOrigin,
  });

  await app.listen(appConfig.port, appConfig.host);
}

void bootstrap();