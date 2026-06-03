import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  Sse,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaded } from '@app/decorators/file-uploaded.decorator';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { PaginationQuery } from '@app/decorators/pagination.decorator';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createPhotoDto: CreatePhotoDto,
    @FileUploaded({
      required: true,
    })
    file: Express.Multer.File,
  ) {
    return this.photosService.create(user, createPhotoDto, file);
  }

  @Sse(':id/upload-status')
  @HttpCode(HttpStatus.OK)
  uploadStatus(@IdParam() id: string) {
    return this.photosService.getUploadStatus(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@PaginationQuery() pagination: PaginationDto) {
    return this.photosService.findAll(pagination);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  findAllByUser(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.photosService.findAllByUser(user, pagination);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.photosService.findOne(user, id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  toggleLike(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.photosService.toggleLike(user, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ) {
    return this.photosService.update(user, id, updatePhotoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.photosService.remove(user, id);
  }
}
