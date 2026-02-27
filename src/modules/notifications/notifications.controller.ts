import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PoliciesGuard } from '@app/guards/policy.guard';
import type { accounts } from '@app/generated/prisma/client';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { IdParam } from '@app/decorators/id-param.decorator';

@Controller('notifications')
@UseGuards(PoliciesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@CurrentUser() user: accounts) {
    return this.notificationsService.findAll(user.id);
  }

  @Get('badge')
  @HttpCode(HttpStatus.OK)
  getBadge(@CurrentUser() user: accounts) {
    return this.notificationsService.getBadge(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  maskNotificationAsRead(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.notificationsService.maskNotificationAsRead(user, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  maskAllNotificationAsRead(@CurrentUser() user: accounts) {
    return this.notificationsService.maskAllNotificationAsRead(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.notificationsService.delete(user, id);
  }
}
