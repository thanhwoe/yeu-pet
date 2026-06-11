import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsUUID, Length, Matches } from 'class-validator';

export class RequestEmailChangeDto {
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  newEmail!: string;
}

export class VerifyEmailChangeDto {
  @IsUUID()
  requestId!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  otp!: string;
}

export class ResendEmailChangeDto {
  @IsUUID()
  requestId!: string;
}

export class CancelEmailChangeDto {
  @IsUUID()
  requestId!: string;
}
