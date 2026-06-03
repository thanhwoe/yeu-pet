import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PhotoCommentsService } from './photo-comments.service';
import { CreatePhotoCommentDto } from './dto/create-photo-comment.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Controller('photos/:id/comments')
export class PhotoCommentsController {
  constructor(private readonly photoCommentsService: PhotoCommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @IdParam() photoId: string,
    @Body() createPhotoCommentDto: CreatePhotoCommentDto,
  ) {
    return this.photoCommentsService.create(
      user,
      photoId,
      createPhotoCommentDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @CurrentUser() user: accounts,
    @IdParam() photoId: string,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.photoCommentsService.findAll(user, photoId, pagination);
  }

  @Get(':cId/replies')
  @HttpCode(HttpStatus.OK)
  findAllReplies(
    @CurrentUser() user: accounts,
    @IdParam() photoId: string,
    @IdParam('cId') commentId: string,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.photoCommentsService.findAllReplies(
      user,
      photoId,
      commentId,
      pagination,
    );
  }

  @Delete(':cId')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: accounts,
    @IdParam('cId') commentId: string,
    @IdParam() photoId: string,
  ) {
    return this.photoCommentsService.remove(user, commentId, photoId);
  }
}
