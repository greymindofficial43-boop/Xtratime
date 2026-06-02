import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { AdsModule } from './ads/ads.module';
import { MenusModule } from './menus/menus.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Serve /public folder as static assets — uploads will be at /uploads/*
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TagsModule,
    ArticlesModule,
    MatchesModule,
    AdsModule,
    MenusModule,
    UploadsModule,
  ],
})
export class AppModule {}
