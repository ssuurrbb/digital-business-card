import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { AdminGuard } from '../common/guards/admin.guard';
import { ProfileService } from '../profile/profile.service';
import {
  CreateExperienceInput,
  ReplaceAchievementsInput,
  UpdateExperienceInput,
} from './dto/experience.inputs';
import { ExperienceService } from './experience.service';
import { Experience } from './models/experience.model';

@Resolver(() => Experience)
export class ExperienceResolver {
  constructor(
    private readonly experienceService: ExperienceService,
    private readonly profileService: ProfileService,
  ) {}

  @Mutation(() => Experience)
  @UseGuards(AdminGuard)
  async createExperience(
    @Args('input') input: CreateExperienceInput,
  ): Promise<Experience> {
    const profile = await this.profileService.requireMe();
    return this.experienceService.create(profile.id, input);
  }

  @Mutation(() => Experience)
  @UseGuards(AdminGuard)
  updateExperience(
    @Args('input') input: UpdateExperienceInput,
  ): Promise<Experience> {
    return this.experienceService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(AdminGuard)
  deleteExperience(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.experienceService.remove(id);
  }

  @Mutation(() => Experience)
  @UseGuards(AdminGuard)
  replaceAchievements(
    @Args('input') input: ReplaceAchievementsInput,
  ): Promise<Experience> {
    return this.experienceService.replaceAchievements(input);
  }
}
