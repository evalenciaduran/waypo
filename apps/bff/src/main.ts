import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 BFF running on http://localhost:${port}`);
}

bootstrap();
