import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaded } from '@app/decorators/file-uploaded.decorator';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  create(
    @CurrentUser() user: accounts,
    @Body() createPetDto: CreatePetDto,
    @FileUploaded()
    avatar?: Express.Multer.File,
  ) {
    return this.petsService.create(user.id, createPetDto, avatar);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@CurrentUser() user: accounts) {
    return this.petsService.findAllByUserId(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @FileUploaded()
    avatar?: Express.Multer.File,
  ) {
    return this.petsService.update(id, updatePetDto, avatar);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
