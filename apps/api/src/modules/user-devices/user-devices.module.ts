import { Module } from '@nestjs/common';
import { UserDevicesService } from './user-devices.service';
import { UserDevicesController } from './user-devices.controller';
import { UserDevicesRepository } from './user-devices.repository';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [CaslModule],
  controllers: [UserDevicesController],
  providers: [UserDevicesService, UserDevicesRepository],
  exports: [UserDevicesRepository],
})
export class UserDevicesModule {}
