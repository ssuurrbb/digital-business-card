import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateProjectInput {
  @Field()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @Field()
  @MinLength(1)
  description!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  repoUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillNames?: string[];
}

@InputType()
export class UpdateProjectInput {
  @Field(() => ID)
  @IsString()
  @MinLength(1)
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  repoUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@InputType()
export class SetProjectSkillsInput {
  @Field(() => ID)
  @IsString()
  @MinLength(1)
  projectId!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  names!: string[];
}
