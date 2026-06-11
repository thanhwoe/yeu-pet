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
import { DeleteUserDto } from './dto/delete-user.dto';
import {
  CancelEmailChangeDto,
  RequestEmailChangeDto,
  ResendEmailChangeDto,
  VerifyEmailChangeDto,
} from './dto/email-change.dto';
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

  @Post('me/email-change/request')
  @HttpCode(HttpStatus.ACCEPTED)
  requestEmailChange(
    @CurrentUser() user: accounts,
    @Body() requestEmailChangeDto: RequestEmailChangeDto,
  ) {
    return this.usersService.requestEmailChange(user.id, requestEmailChangeDto);
  }

  @Post('me/email-change/verify')
  @HttpCode(HttpStatus.OK)
  verifyEmailChange(
    @CurrentUser() user: accounts,
    @Body() verifyEmailChangeDto: VerifyEmailChangeDto,
  ) {
    return this.usersService.verifyEmailChange(user.id, verifyEmailChangeDto);
  }

  @Post('me/email-change/resend')
  @HttpCode(HttpStatus.ACCEPTED)
  resendEmailChange(
    @CurrentUser() user: accounts,
    @Body() resendEmailChangeDto: ResendEmailChangeDto,
  ) {
    return this.usersService.resendEmailChange(user.id, resendEmailChangeDto);
  }

  @Post('me/email-change/cancel')
  @HttpCode(HttpStatus.OK)
  cancelEmailChange(
    @CurrentUser() user: accounts,
    @Body() cancelEmailChangeDto: CancelEmailChangeDto,
  ) {
    return this.usersService.cancelEmailChange(user.id, cancelEmailChangeDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deactivateMe(
    @CurrentUser() user: accounts,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.usersService.deactivateAccount(user.id, deleteUserDto.password);
  }
}
