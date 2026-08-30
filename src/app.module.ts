import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { VersionsModule } from './versions/versions.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ServicesModule,
    VersionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
