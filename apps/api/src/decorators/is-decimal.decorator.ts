import { applyDecorators } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import { Transform } from 'class-transformer';
import {
  buildMessage,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsDecimal(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Transform(({ value }: { value: unknown }) => {
      if (value instanceof Decimal) return value;
      if (value === null || value === undefined) return value;
      if (typeof value === 'number') return new Decimal(value);
      if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return undefined;
        }

        try {
          return new Decimal(trimmedValue);
        } catch {
          return value;
        }
      }
      return value;
    }),
    // @ts-expect-error ----
    (target: object, propertyKey: string): void => {
      registerDecorator({
        name: 'isDecimal',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        target: (target as { constructor: Function }).constructor,
        propertyName: propertyKey,
        options: {
          message: `${propertyKey} must be a decimal or number`,
          ...validationOptions,
        },
        validator: {
          validate(value: unknown) {
            return value instanceof Decimal;
          },
          defaultMessage: buildMessage(
            (eachPrefix) =>
              eachPrefix + `${propertyKey} must be a decimal or number`,
            validationOptions,
          ),
        },
      });
    },
  );
}
