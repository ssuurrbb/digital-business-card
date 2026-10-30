import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExperienceInput,
  ReplaceAchievementsInput,
  UpdateExperienceInput,
} from './dto/experience.inputs';
import { Experience } from './models/experience.model';
import { formatPeriod } from '../common/date/period';
import type { Achievement, Experience as ExperienceRow } from '@prisma/client';

type ExperienceWithAchievements = ExperienceRow & {
  achievements: Achievement[];
};

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  toGraphQL(row: ExperienceWithAchievements): Experience {
    return {
      id: row.id,
      company: row.company,
      companyUrl: row.companyUrl,
      position: row.position,
      startDate: row.startDate,
      endDate: row.endDate,
      period: formatPeriod(row.startDate, row.endDate),
      isCurrent: row.endDate === null,
      sortOrder: row.sortOrder,
      achievements: row.achievements,
    };
  }

  async create(
    profileId: string,
    input: CreateExperienceInput,
  ): Promise<Experience> {
    const row = await this.prisma.experience.create({
      data: {
        profileId,
        company: input.company,
        companyUrl: input.companyUrl,
        position: input.position,
        startDate: input.startDate,
        endDate: input.endDate,
        sortOrder: input.sortOrder ?? 0,
        achievements: input.achievements
          ? {
              create: input.achievements.map((text, sortOrder) => ({
                text,
                sortOrder,
              })),
            }
          : undefined,
      },
      include: { achievements: { orderBy: { sortOrder: 'asc' } } },
    });

    return this.toGraphQL(row);
  }

  async update(input: UpdateExperienceInput): Promise<Experience> {
    await this.ensureExists(input.id);

    const row = await this.prisma.experience.update({
      where: { id: input.id },
      data: {
        company: input.company,
        companyUrl: input.companyUrl,
        position: input.position,
        startDate: input.startDate,
        endDate: input.endDate,
        sortOrder: input.sortOrder,
      },
      include: { achievements: { orderBy: { sortOrder: 'asc' } } },
    });

    return this.toGraphQL(row);
  }

  async remove(id: string): Promise<boolean> {
    await this.ensureExists(id);
    await this.prisma.experience.delete({ where: { id } });
    return true;
  }

  async replaceAchievements(
    input: ReplaceAchievementsInput,
  ): Promise<Experience> {
    await this.ensureExists(input.experienceId);

    const row = await this.prisma.$transaction(async (tx: PrismaService) => {
      await tx.achievement.deleteMany({
        where: { experienceId: input.experienceId },
      });
      await tx.achievement.createMany({
        data: input.texts.map((text, sortOrder) => ({
          experienceId: input.experienceId,
          text,
          sortOrder,
        })),
      });
      return tx.experience.findUniqueOrThrow({
        where: { id: input.experienceId },
        include: { achievements: { orderBy: { sortOrder: 'asc' } } },
      });
    });

    return this.toGraphQL(row);
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.experience.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`Experience ${id} not found`);
    }
  }
}
