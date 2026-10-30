import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @MinLength(1)
  @MaxLength(80)
  login!: string;

  @Field()
  @MinLength(1)
  @MaxLength(200)
  password!: string;
}
