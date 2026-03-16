import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import dayjs from 'dayjs';

@ValidatorConstraint({ name: 'isAfterNow', async: false })
class IsAfterNowConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return dayjs(value).isValid() && dayjs(value).isAfter(dayjs());
  }

  defaultMessage() {
    return '$property must be a future date';
  }
}

export function IsAfterNow(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsAfterNowConstraint,
    });
}

@ValidatorConstraint({ name: 'isAfterField', async: false })
class IsAfterFieldConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const [relatedField] = args.constraints as [string];
    const relatedValue = (args.object as Record<string, string>)[relatedField];
    return (
      dayjs(value).isValid() &&
      dayjs(relatedValue).isValid() &&
      dayjs(value).isAfter(dayjs(relatedValue))
    );
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedField] = args.constraints as [string];
    return `$property must be after ${relatedField}`;
  }
}

export function IsAfterField(field: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: [field],
      options,
      validator: IsAfterFieldConstraint,
    });
}
