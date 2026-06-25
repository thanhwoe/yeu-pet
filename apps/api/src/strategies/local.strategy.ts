import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { accounts } from '@app/generated/prisma/client';
import { AuthService } from '@app/modules/auth/auth.service';
import { API_ERROR_CODES } from '@app/errors/api-error-codes';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phone',
      passwordField: 'password',
    });
  }

  async validate(phone: string, password: string): Promise<accounts> {
    const user = await this.authService.validateUser(phone, password);
    if (!user) {
      throw new UnauthorizedException({
        errorCode: API_ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid phone or password',
        messageKey: 'errors.auth.invalidCredentials',
      });
    }
    return user;
  }
}
