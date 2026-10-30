import type { Experience, ProfileLink, Skill, SkillCategory } from '@/types';

export const VISIBLE_ACHIEVEMENTS = 4;

const SKILL_GROUPS: { title: string; categories: SkillCategory[] }[] = [
  { title: 'Языки и runtime', categories: ['LANGUAGE', 'RUNTIME'] },
  { title: 'Фреймворки', categories: ['FRAMEWORK'] },
  { title: 'Данные', categories: ['DATABASE'] },
  { title: 'Инфра', categories: ['INFRA'] },
  { title: 'Инструменты', categories: ['TOOL'] },
  { title: 'Ещё', categories: ['OTHER'] },
];

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export function isEmailLink(link: ProfileLink): boolean {
  return link.kind === 'EMAIL' || link.url.startsWith('mailto:');
}

export function emailLink(links: ProfileLink[]): ProfileLink | undefined {
  return links.find(isEmailLink);
}

export function writeLink(links: ProfileLink[]): ProfileLink | undefined {
  return emailLink(links) ?? links[0];
}

export function displayLink(link: ProfileLink): string {
  if (isEmailLink(link)) {
    return link.url.replace(/^mailto:/i, '');
  }
  if (link.url.startsWith('https://t.me/')) {
    return `@${link.url.slice('https://t.me/'.length)}`;
  }
  return link.label;
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function seekingSentence(description: string): string | null {
  const match = description.match(/[^.!?]*ищу[^.!?]*[.!?]?/i);
  const text = match?.[0]?.trim();
  return text ? text : null;
}

export function moreLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `Ещё ${count} пункт`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `Ещё ${count} пункта`;
  }
  return `Ещё ${count} пунктов`;
}

export function splitAchievements(job: Experience): {
  visible: Experience['achievements'];
  hidden: Experience['achievements'];
} {
  if (job.achievements.length <= VISIBLE_ACHIEVEMENTS) {
    return { visible: job.achievements, hidden: [] };
  }
  return {
    visible: job.achievements.slice(0, VISIBLE_ACHIEVEMENTS),
    hidden: job.achievements.slice(VISIBLE_ACHIEVEMENTS),
  };
}

export function skillGroups(
  skills: Skill[],
): Array<{ title: string; skills: Skill[] }> {
  return SKILL_GROUPS.flatMap((group) => {
    const items = skills.filter((skill) =>
      group.categories.includes(skill.category),
    );
    return items.length > 0 ? [{ title: group.title, skills: items }] : [];
  });
}
