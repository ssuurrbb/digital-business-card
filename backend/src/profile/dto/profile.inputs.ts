import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LinkKind } from '../../common/enums';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(180)
  headline?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(80)
  location?: string;
}

@InputType()
export class ProfileLinkInput {
  @Field(() => LinkKind)
  @IsEnum(LinkKind)
  kind!: LinkKind;

  @Field()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @Field()
  @MinLength(3)
  @MaxLength(500)
  url!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@InputType()
export class ReplaceLinksInput {
  @Field(() => [ProfileLinkInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileLinkInput)
  links!: ProfileLinkInput[];
}

@InputType()
export class SetProfileSkillsInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  names!: string[];
}
