import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectInput,
  SetProjectSkillsInput,
  UpdateProjectInput,
} from './dto/project.inputs';
import { Project } from './models/project.model';

const projectInclude = {
  skills: {
    include: { skill: true as const },
    orderBy: { skill: { name: 'asc' as const } },
  },
};

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  repoUrl: string | null;
  sortOrder: number;
  skills: Array<{ skill: Project['skills'][number] }>;
};

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  toGraphQL(row: ProjectRow): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      url: row.url,
      repoUrl: row.repoUrl,
      sortOrder: row.sortOrder,
      skills: row.skills.map((item) => item.skill),
    };
  }

  async create(profileId: string, input: CreateProjectInput): Promise<Project> {
    const skillIds = await this.resolveSkillIds(input.skillNames ?? []);

    const row = await this.prisma.project.create({
      data: {
        profileId,
        name: input.name,
        description: input.description,
        url: input.url,
        repoUrl: input.repoUrl,
        sortOrder: input.sortOrder ?? 0,
        skills: {
          create: skillIds.map((skillId) => ({ skillId })),
        },
      },
      include: projectInclude,
    });

    return this.toGraphQL(row);
  }

  async update(input: UpdateProjectInput): Promise<Project> {
    await this.ensureExists(input.id);

    const row = await this.prisma.project.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        url: input.url,
        repoUrl: input.repoUrl,
        sortOrder: input.sortOrder,
      },
      include: projectInclude,
    });

    return this.toGraphQL(row);
  }

  async remove(id: string): Promise<boolean> {
    await this.ensureExists(id);
    await this.prisma.project.delete({ where: { id } });
    return true;
  }

  async setSkills(input: SetProjectSkillsInput): Promise<Project> {
    await this.ensureExists(input.projectId);
    const skillIds = await this.resolveSkillIds(input.names);

    const row = await this.prisma.$transaction(async (tx: PrismaService) => {
      await tx.projectSkill.deleteMany({
        where: { projectId: input.projectId },
      });
      await tx.projectSkill.createMany({
        data: skillIds.map((skillId) => ({
          projectId: input.projectId,
          skillId,
        })),
      });
      return tx.project.findUniqueOrThrow({
        where: { id: input.projectId },
        include: projectInclude,
      });
    });

    return this.toGraphQL(row);
  }

  private async resolveSkillIds(names: string[]): Promise<string[]> {
    if (names.length === 0) {
      return [];
    }

    const skills: Array<{ id: string; name: string }> =
      await this.prisma.skill.findMany({
        where: { name: { in: names } },
        select: { id: true, name: true },
      });
    const found = new Set(skills.map((skill) => skill.name));
    const missing = names.filter((name) => !found.has(name));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Unknown skills: ${missing.join(', ')}. Create them via upsertSkill first.`,
      );
    }

    const byName = new Map(skills.map((skill) => [skill.name, skill.id]));
    return names.map((name) => {
      const skillId = byName.get(name);
      if (!skillId) {
        throw new BadRequestException(`Unknown skill: ${name}`);
      }
      return skillId;
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }
}
