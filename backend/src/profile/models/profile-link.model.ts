import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { LinkKind } from '../../common/enums';

@ObjectType()
export class ProfileLink {
  @Field(() => ID)
  id!: string;

  @Field(() => LinkKind)
  kind!: LinkKind;

  @Field()
  label!: string;

  @Field()
  url!: string;

  @Field(() => Int)
  sortOrder!: number;
}
