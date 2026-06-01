import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { Cacheable, CacheEvict } from '@app/decorators/cache.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaded } from '@app/decorators/file-uploaded.decorator';
import { PoliciesGuard } from '@app/guards/policy.guard';
import { CheckPolicies } from '@app/decorators/policy.decorator';
import { Action } from '../casl/casl.types';
import { IdParam } from '@app/decorators/id-param.decorator';
import { PaginationQuery } from '@app/decorators/pagination.decorator';
import { PaginationDto } from '../shared/dto/pagination.dto';
import {
  ApiCreatedWrappedResponse,
  ApiOkWrappedResponse,
  ApiPaginatedResponse,
} from '@app/decorators/swagger-response.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pets')
@Controller('pets')
@UseGuards(PoliciesGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @CacheEvict()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Pets'))
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedWrappedResponse()
  create(
    @CurrentUser() user: accounts,
    @Body() createPetDto: CreatePetDto,
    @FileUploaded()
    avatar?: Express.Multer.File,
  ) {
    return this.petsService.create(user.id, createPetDto, avatar);
  }

  @Get()
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  @ApiPaginatedResponse()
  findAll(
    @CurrentUser() user: accounts,
    @PaginationQuery() pagination: PaginationDto,
  ) {
    return this.petsService.findAllByUserId(user.id, pagination);
  }

  @Get(':id')
  @Cacheable(60)
  @HttpCode(HttpStatus.OK)
  @ApiOkWrappedResponse()
  findOne(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.petsService.findOne(user, id);
  }

  @Patch(':id')
  @CacheEvict()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOkWrappedResponse()
  update(
    @CurrentUser() user: accounts,
    @IdParam() id: string,
    @Body() updatePetDto: UpdatePetDto,
    @FileUploaded()
    avatar?: Express.Multer.File,
  ) {
    return this.petsService.update(user, id, updatePetDto, avatar);
  }

  @Delete(':id')
  @CacheEvict()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: accounts, @IdParam() id: string) {
    return this.petsService.remove(user, id);
  }
}
