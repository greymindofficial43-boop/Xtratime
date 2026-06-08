import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Increase payload limits to allow large article content uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  // Auth is via Bearer token (Authorization header, stored client-side) — not
  // cookies — so we don't need credentialed CORS. We allow all origins because
  // the reverse proxy (LiteSpeed/Nginx) can strip the Origin header, which would
  // otherwise break origin-reflection. Public read API + token-gated writes.
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}

// Exit on startup failure (e.g. DB not ready yet at boot) so PM2 restarts us
// and retries until Postgres is up — prevents the "online but dead" boot race.
bootstrap().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
