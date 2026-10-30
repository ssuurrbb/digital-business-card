import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Achievement {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;

  @Field(() => Int)
  sortOrder!: number;
}
