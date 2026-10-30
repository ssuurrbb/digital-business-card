import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './models/auth-payload.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput): AuthPayload {
    return this.authService.login(input);
  }

  @Query(() => Boolean, {
    description: 'Проверка, что передан действующий админ-токен.',
  })
  @UseGuards(AdminGuard)
  adminSession(): boolean {
    return true;
  }
}
