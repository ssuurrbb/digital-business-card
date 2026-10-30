import { UseGuards } from '@nestjs/common';
import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { GraphQLResolveInfo } from 'graphql';
import { AdminGuard } from '../common/guards/admin.guard';
import {
  ReplaceLinksInput,
  SetProfileSkillsInput,
  UpdateProfileInput,
} from './dto/profile.inputs';
import { Profile } from './models/profile.model';
import { profileInclude } from './profile.include';
import { ProfileService } from './profile.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, {
    description: 'Публичная визитка. Include в Prisma строится по selection set.',
  })
  profile(@Info() info: GraphQLResolveInfo): Promise<Profile> {
    return this.profileService.findMe(profileInclude(info));
  }

  @Mutation(() => Profile)
  @UseGuards(AdminGuard)
  updateProfile(@Args('input') input: UpdateProfileInput): Promise<Profile> {
    return this.profileService.update(input);
  }

  @Mutation(() => Profile)
  @UseGuards(AdminGuard)
  replaceLinks(@Args('input') input: ReplaceLinksInput): Promise<Profile> {
    return this.profileService.replaceLinks(input);
  }

  @Mutation(() => Profile)
  @UseGuards(AdminGuard)
  setProfileSkills(
    @Args('input') input: SetProfileSkillsInput,
  ): Promise<Profile> {
    return this.profileService.setSkills(input);
  }
}
