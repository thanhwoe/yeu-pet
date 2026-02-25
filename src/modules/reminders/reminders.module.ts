import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersRepository } from './reminders.repository';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [CaslModule],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersRepository],
})
export class RemindersModule {}
