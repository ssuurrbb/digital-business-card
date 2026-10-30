import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { AdminGuard } from '../common/guards/admin.guard';
import { ProfileService } from '../profile/profile.service';
import {
  CreateProjectInput,
  SetProjectSkillsInput,
  UpdateProjectInput,
} from './dto/project.inputs';
import { Project } from './models/project.model';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly profileService: ProfileService,
  ) {}

  @Mutation(() => Project)
  @UseGuards(AdminGuard)
  async createProject(
    @Args('input') input: CreateProjectInput,
  ): Promise<Project> {
    const profile = await this.profileService.requireMe();
    return this.projectService.create(profile.id, input);
  }

  @Mutation(() => Project)
  @UseGuards(AdminGuard)
  updateProject(@Args('input') input: UpdateProjectInput): Promise<Project> {
    return this.projectService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(AdminGuard)
  deleteProject(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.projectService.remove(id);
  }

  @Mutation(() => Project)
  @UseGuards(AdminGuard)
  setProjectSkills(
    @Args('input') input: SetProjectSkillsInput,
  ): Promise<Project> {
    return this.projectService.setSkills(input);
  }
}
