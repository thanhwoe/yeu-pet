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
  UseGuards,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaded } from '@app/decorators/file-uploaded.decorator';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';

@Controller('pets')
@UseGuards(PoliciesGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Pets'))
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
  findOne(@CurrentUser() user: accounts, @Param('id') id: string) {
    return this.petsService.findOne(user, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @CurrentUser() user: accounts,
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @FileUploaded()
    avatar?: Express.Multer.File,
  ) {
    return this.petsService.update(user, id, updatePetDto, avatar);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: accounts, @Param('id') id: string) {
    return this.petsService.remove(user, id);
  }
}
