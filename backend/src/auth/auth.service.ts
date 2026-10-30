import { createHash, timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './models/auth-payload.model';

@Injectable()
export class AuthService {
  constructor(private readonly config: ConfigService) {}

  login(input: LoginInput): AuthPayload {
    const login = this.config.get<string>('ADMIN_LOGIN');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    const token = this.config.get<string>('ADMIN_API_KEY');

    if (!login || !password || !token) {
      throw new UnauthorizedException('Admin is not configured');
    }

    const loginOk = this.equal(input.login, login);
    const passwordOk = this.equal(input.password, password);
    if (!loginOk || !passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { token };
  }

  private equal(left: string, right: string): boolean {
    const a = createHash('sha256').update(left).digest();
    const b = createHash('sha256').update(right).digest();
    return timingSafeEqual(a, b);
  }
}
