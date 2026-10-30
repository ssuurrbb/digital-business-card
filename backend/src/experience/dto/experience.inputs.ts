import { Field, GraphQLISODateTime, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateExperienceInput {
  @Field()
  @MinLength(1)
  @MaxLength(120)
  company!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  companyUrl?: string;

  @Field()
  @MinLength(1)
  @MaxLength(120)
  position!: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  startDate!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];
}

@InputType()
export class UpdateExperienceInput {
  @Field(() => ID)
  @IsString()
  @MinLength(1)
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(120)
  company?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  companyUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(120)
  position?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@InputType()
export class ReplaceAchievementsInput {
  @Field(() => ID)
  @IsString()
  @MinLength(1)
  experienceId!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  texts!: string[];
}
