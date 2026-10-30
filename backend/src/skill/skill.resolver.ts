import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminGuard } from '../common/guards/admin.guard';
import { UpsertSkillInput } from './dto/upsert-skill.input';
import { Skill } from './models/skill.model';
import { SkillService } from './skill.service';

@Resolver(() => Skill)
export class SkillResolver {
  constructor(private readonly skillService: SkillService) {}

  @Query(() => [Skill], {
    description: 'Справочник навыков. Нужен админке, чтобы вешать стек на проекты.',
  })
  skills(): Promise<Skill[]> {
    return this.skillService.findAll();
  }

  @Mutation(() => Skill)
  @UseGuards(AdminGuard)
  upsertSkill(@Args('input') input: UpsertSkillInput): Promise<Skill> {
    return this.skillService.upsert(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(AdminGuard)
  deleteSkill(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.skillService.remove(id);
  }
}
