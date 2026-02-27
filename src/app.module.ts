import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerModule, minutes, seconds } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { SharedModule } from './modules/shared/shared.module';
import { PetsModule } from './modules/pets/pets.module';
import { CaslModule } from './modules/casl/casl.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { UserDevicesModule } from './modules/user-devices/user-devices.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          // anti-spam
          name: 'burst',
          ttl: seconds(1),
          limit: 10,
        },
        {
          // anti-abuse
          name: 'sustained',
          ttl: minutes(1),
          limit: 100,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    SharedModule,
    PetsModule,
    CaslModule,
    MedicalRecordsModule,
    UserDevicesModule,
    RemindersModule,
    NotificationsModule,
    UserSettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
