import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from '@/app.module';
import { appConfig } from '@/shared/config';
import { ApiExceptionFilter } from '@/shared/filters/api-exception.filter';

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
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(appConfig.port, appConfig.host);
}

void bootstrap();