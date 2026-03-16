import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class AllowValuesPipe<
  T extends Record<string, string>,
> implements PipeTransform<string, T[keyof T] | undefined> {
  constructor(private readonly enumType: T) {}

  transform(
    value: string | undefined,
    metadata: ArgumentMetadata,
  ): T[keyof T] | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const validValues = Object.values(this.enumType);

    if (!validValues.includes(value)) {
      throw new BadRequestException(
        `Invalid value ${value} for ${metadata.data}. ` +
          `Allowed values: ${validValues.join(', ')}`,
      );
    }

    return value as T[keyof T];
  }
}
