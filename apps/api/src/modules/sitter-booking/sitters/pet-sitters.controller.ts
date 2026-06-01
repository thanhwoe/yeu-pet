import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PetSittersService } from './pet-sitters.service';
import { CreatePetSitterDto } from './dto/create-pet-sitter.dto';
import { UpdatePetSitterDto } from './dto/update-pet-sitter.dto';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IdParam } from '@app/decorators/id-param.decorator';

@Controller('sitters')
export class PetSittersController {
  constructor(private readonly petSittersService: PetSittersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: accounts,
    @Body() createPetSitterDto: CreatePetSitterDto,
  ) {
    return this.petSittersService.create(user, createPetSitterDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @PaginationQuery() pagination: PaginationDto,
    @Query('address') address?: string,
  ) {
    return this.petSittersService.findAll(pagination, address);
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  findMe(@CurrentUser() user: accounts) {
    return this.petSittersService.findMe(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.petSittersService.findOne(user, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updatePetSitterDto: UpdatePetSitterDto,
  ) {
    return this.petSittersService.update(user, id, updatePetSitterDto);
  }
}
