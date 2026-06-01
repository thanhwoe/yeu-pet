import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, minutes, seconds } from '@nestjs/throttler';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './filters/prisma-exceptions.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { ErrorLoggingInterceptor } from './interceptors/error-logging.interceptor';
import { TrackInterceptor } from './interceptors/track.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { BudgetModule } from './modules/budget/budget.module';
import { CaslModule } from './modules/casl/casl.module';
import { FiledWorkersModule } from './modules/file-workers/file-workers.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PetsModule } from './modules/pets/pets.module';
import { PhotosModule } from './modules/photos/photos.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { SharedModule } from './modules/shared/shared.module';
import { SitterBookingModule } from './modules/sitter-booking/sitter-booking.module';
import { UserDevicesModule } from './modules/user-devices/user-devices.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { UsersModule } from './modules/users/users.module';

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
    SentryModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    SharedModule,
    FiledWorkersModule,
    PetsModule,
    CaslModule,
    MedicalRecordsModule,
    UserDevicesModule,
    RemindersModule,
    NotificationsModule,
    UserSettingsModule,
    BudgetModule,
    PhotosModule,
    SitterBookingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TrackInterceptor,
    },
  ],
})
export class AppModule {}
