import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Experience } from '../../experience/models/experience.model';
import { Project } from '../../project/models/project.model';
import { Skill } from '../../skill/models/skill.model';
import { ProfileLink } from './profile-link.model';

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  headline!: string;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  location!: string | null;

  @Field(() => [ProfileLink])
  links!: ProfileLink[];

  @Field(() => [Skill])
  skills!: Skill[];

  @Field(() => [Experience])
  experience!: Experience[];

  @Field(() => [Project])
  projects!: Project[];
}
