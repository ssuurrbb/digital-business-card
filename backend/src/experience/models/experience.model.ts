import { Field, GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';
import { Achievement } from './achievement.model';

@ObjectType()
export class Experience {
  @Field(() => ID)
  id!: string;

  @Field()
  company!: string;

  @Field(() => String, { nullable: true })
  companyUrl!: string | null;

  @Field()
  position!: string;

  @Field(() => GraphQLISODateTime)
  startDate!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate!: Date | null;

  @Field({ description: 'Человекочитаемый период, например «Апрель 2024 — настоящее время»' })
  period!: string;

  @Field()
  isCurrent!: boolean;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => [Achievement])
  achievements!: Achievement[];
}
