import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './schema/user.entity';
import { HttpException } from './common/exceptions/http-exception';
import { UrlShortenerController } from './url-shortener/controllers/url-shortener.controller';
import { UrlShortenerService } from './url-shortener/services/url-shortener.service';
import { UrlShortener } from './schema/url-shortener.entity';
import { DtoValidatorService } from './common/validations/dto-validator.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [User, UrlShortener],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UrlShortener]),
  ],
  controllers: [UrlShortenerController],
  providers: [
    HttpException,
    DtoValidatorService,
    UrlShortenerService
  ],
})

export class AppModule { }
