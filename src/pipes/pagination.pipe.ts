import { PaginationDto } from '@app/modules/shared/dto/pagination.dto';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class PaginationPipe implements PipeTransform<
  any,
  Promise<PaginationDto>
> {
  async transform(value: any): Promise<PaginationDto> {
    const dto = plainToInstance(PaginationDto, value);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      throw new BadRequestException({
        message: messages,
        error: 'Validation failed',
      });
    }

    return dto;
  }
}
