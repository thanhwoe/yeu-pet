import { Injectable } from '@nestjs/common';
import { UpdateUserSettingDto } from './dto/update-user-setting.dto';
import { accounts } from '@app/generated/prisma/client';
import { UserSettingsRepository } from './user-settings.repository';

@Injectable()
export class UserSettingsService {
  constructor(
    private readonly userSettingsRepository: UserSettingsRepository,
  ) {}
  async findOne(user: accounts) {
    const record = await this.userSettingsRepository.findById(user.id);
    if (!record) {
      return this.userSettingsRepository.upsert(user.id, {
        account_id: user.id,
      });
    }
    return record;
  }

  async upsert(user: accounts, updateUserSettingDto: UpdateUserSettingDto) {
    return this.userSettingsRepository.upsert(user.id, {
      notification_enable: updateUserSettingDto?.notificationEnable,
      reminder_notifications: updateUserSettingDto.reminderNotifications,
      booking_notifications: updateUserSettingDto.bookingNotifications,
      social_notifications: updateUserSettingDto.socialNotifications,
      ai_notifications: updateUserSettingDto.aiNotifications,
      language: updateUserSettingDto.language,
      theme: updateUserSettingDto.theme,
    });
  }
}
