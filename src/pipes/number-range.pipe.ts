import { PipeTransform, BadRequestException } from '@nestjs/common';

export class NumberRangePipe implements PipeTransform {
  constructor(
    private readonly min: number,
    private readonly max: number,
    private readonly name = 'value',
  ) {}

  transform(value: any) {
    if (value === null || value === undefined) {
      return undefined;
    }

    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      throw new BadRequestException(`${this.name} must be an integer`);
    }
    if (num < this.min || num > this.max) {
      throw new BadRequestException(
        `${this.name} must be between ${this.min} and ${this.max}`,
      );
    }
    return num;
  }
}
