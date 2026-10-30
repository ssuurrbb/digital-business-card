import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Skill } from '../../skill/models/skill.model';

@ObjectType()
export class Project {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field(() => String, { nullable: true })
  repoUrl!: string | null;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => [Skill])
  skills!: Skill[];
}
