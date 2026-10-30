import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { formatPeriod } from '../common/date/period';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReplaceLinksInput,
  SetProfileSkillsInput,
  UpdateProfileInput,
} from './dto/profile.inputs';
import { Profile } from './models/profile.model';
import { fullProfileInclude, type ProfileInclude } from './profile.include';

export const PROFILE_SLUG = 'me';

type LoadedProfile = {
  id: string;
  name: string;
  headline: string;
  description: string;
  location: string | null;
  links?: Profile['links'];
  skills?: Array<{ skill: Profile['skills'][number] }>;
  experiences?: Array<{
    id: string;
    company: string;
    companyUrl: string | null;
    position: string;
    startDate: Date;
    endDate: Date | null;
    sortOrder: number;
    achievements?: Profile['experience'][number]['achievements'];
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    url: string | null;
    repoUrl: string | null;
    sortOrder: number;
    skills?: Array<{ skill: Profile['projects'][number]['skills'][number] }>;
  }>;
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  toGraphQL(row: LoadedProfile): Profile {
    return {
      id: row.id,
      name: row.name,
      headline: row.headline,
      description: row.description,
      location: row.location,
      links: row.links ?? [],
      skills: (row.skills ?? []).map((item) => item.skill),
      experience: (row.experiences ?? []).map((item) => ({
        id: item.id,
        company: item.company,
        companyUrl: item.companyUrl,
        position: item.position,
        startDate: item.startDate,
        endDate: item.endDate,
        period: formatPeriod(item.startDate, item.endDate),
        isCurrent: item.endDate === null,
        sortOrder: item.sortOrder,
        achievements: item.achievements ?? [],
      })),
      projects: (row.projects ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        url: item.url,
        repoUrl: item.repoUrl,
        sortOrder: item.sortOrder,
        skills: (item.skills ?? []).map((projectSkill) => projectSkill.skill),
      })),
    };
  }

  async requireMe() {
    const profile = await this.prisma.profile.findUnique({
      where: { slug: PROFILE_SLUG },
    });
    if (!profile) {
      throw new NotFoundException('Profile is not seeded');
    }
    return profile;
  }

  async findMe(include: ProfileInclude): Promise<Profile> {
    const row = await this.prisma.profile.findUnique({
      where: { slug: PROFILE_SLUG },
      include,
    });
    if (!row) {
      throw new NotFoundException('Profile is not seeded');
    }
    return this.toGraphQL(row as unknown as LoadedProfile);
  }

  async update(input: UpdateProfileInput): Promise<Profile> {
    await this.requireMe();
    const row = await this.prisma.profile.update({
      where: { slug: PROFILE_SLUG },
      data: input,
      include: fullProfileInclude,
    });
    return this.toGraphQL(row);
  }

  async replaceLinks(input: ReplaceLinksInput): Promise<Profile> {
    const profile = await this.requireMe();

    const row = await this.prisma.$transaction(async (tx: PrismaService) => {
      await tx.profileLink.deleteMany({ where: { profileId: profile.id } });
      await tx.profileLink.createMany({
        data: input.links.map((link, index) => ({
          profileId: profile.id,
          kind: link.kind,
          label: link.label,
          url: link.url,
          sortOrder: link.sortOrder ?? index,
        })),
      });
      return tx.profile.findUniqueOrThrow({
        where: { slug: PROFILE_SLUG },
        include: fullProfileInclude,
      });
    });

    return this.toGraphQL(row);
  }

  async setSkills(input: SetProfileSkillsInput): Promise<Profile> {
    const profile = await this.requireMe();
    const skillIds = await this.resolveSkillIds(input.names);

    const row = await this.prisma.$transaction(async (tx: PrismaService) => {
      await tx.profileSkill.deleteMany({ where: { profileId: profile.id } });
      await tx.profileSkill.createMany({
        data: skillIds.map((skillId, sortOrder) => ({
          profileId: profile.id,
          skillId,
          sortOrder,
        })),
      });
      return tx.profile.findUniqueOrThrow({
        where: { slug: PROFILE_SLUG },
        include: fullProfileInclude,
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
}
