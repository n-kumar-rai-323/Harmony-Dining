import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'minWords', async: false })
class MinWordsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;
    const [min] = args.constraints as [number];
    const words = value.trim().split(/\s+/).filter(Boolean);
    return words.length >= min;
  }

  defaultMessage(args: ValidationArguments): string {
    const [min] = args.constraints as [number];
    return `${args.property} must contain at least ${min} word${min === 1 ? '' : 's'}`;
  }
}

/** Rejects strings with fewer than `min` whitespace-separated words. */
export function MinWords(min: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [min],
      validator: MinWordsConstraint,
    });
  };
}
