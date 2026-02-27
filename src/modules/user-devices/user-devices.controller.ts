import {
  Controller,
  Post,
  Body,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserDevicesService } from './user-devices.service';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';
import { IdParam } from '@app/decorators/id-param.decorator';

@Controller('devices')
@UseGuards(PoliciesGuard)
export class UserDevicesController {
  constructor(private readonly userDevicesService: UserDevicesService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'UserDevices'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createUserDeviceDto: CreateUserDeviceDto,
  ) {
    return this.userDevicesService.create(user, createUserDeviceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.userDevicesService.remove(user, id);
  }
}
