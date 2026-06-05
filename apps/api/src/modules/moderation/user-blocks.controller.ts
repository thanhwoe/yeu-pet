import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { ModerationService } from './moderation.service';

@Controller('blocks')
export class UserBlocksController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  findMine(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.moderationService.findMyBlocks(user, pagination);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  block(@CurrentUser() user: accounts, @IdParam() accountId: string) {
    return this.moderationService.blockUser(user, accountId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  unblock(@CurrentUser() user: accounts, @IdParam() accountId: string) {
    return this.moderationService.unblockUser(user, accountId);
  }
}
