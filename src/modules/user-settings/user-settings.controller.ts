import { Controller, Get, Body, Put } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';

@Controller('settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  findOne(@CurrentUser() user: accounts) {
    return this.userSettingsService.findOne(user);
  }

  @Put()
  update(
    @CurrentUser() user: accounts,
    @Body() updateUserSettingDto: UpdateUserSettingDto,
  ) {
    return this.userSettingsService.upsert(user, updateUserSettingDto);
  }
}
