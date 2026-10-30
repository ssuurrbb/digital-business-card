import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { SkillCategory } from '../../common/enums';

@InputType()
export class UpsertSkillInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @Field(() => SkillCategory)
  @IsEnum(SkillCategory)
  category!: SkillCategory;
}
