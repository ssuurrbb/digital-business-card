import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSkillInput } from './dto/upsert-skill.input';
import { Skill } from './models/skill.model';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }

  upsert(input: UpsertSkillInput): Promise<Skill> {
    return this.prisma.skill.upsert({
      where: { name: input.name },
      create: {
        name: input.name,
        category: input.category,
      },
      update: {
        category: input.category,
      },
    });
  }

  async remove(id: string): Promise<boolean> {
    const found = await this.prisma.skill.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`Skill ${id} not found`);
    }
    await this.prisma.skill.delete({ where: { id } });
    return true;
  }
}
