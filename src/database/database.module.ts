import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'kong'),
        password: config.get<string>('DATABASE_PASSWORD', 'kong'),
        database: config.get<string>('DATABASE_NAME', 'services'),
        autoLoadEntities: true,
        synchronize: false,
        // Apply pending migrations at startup.
        migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
