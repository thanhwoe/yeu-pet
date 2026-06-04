import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import { FileUploaded } from '@app/decorators/file-uploaded.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller()
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@CurrentUser() user: accounts) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  updateMe(
    @CurrentUser() user: accounts,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.ACCEPTED)
  uploadAvatar(
    @CurrentUser() user: accounts,
    @FileUploaded({ required: true })
    avatar: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(user.id, avatar);
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.OK)
  deleteAvatar(@CurrentUser() user: accounts) {
    return this.usersService.deleteAvatar(user.id);
  }
}
