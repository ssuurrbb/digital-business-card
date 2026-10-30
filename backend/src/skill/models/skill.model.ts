import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SkillCategory } from '../../common/enums';

@ObjectType()
export class Skill {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => SkillCategory)
  category!: SkillCategory;
}
