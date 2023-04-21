import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMobileNumberPH', async: false })
export class IsMobileNumberPHConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    // Regular expression pattern for Philippine mobile numbers
    const pattern = /^(\+?63|0)9\d{9}$/;
    return pattern.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid mobile number';
  }
}
