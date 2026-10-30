export type LinkKind =
  | 'EMAIL'
  | 'GITHUB'
  | 'HH'
  | 'LINKEDIN'
  | 'OTHER'
  | 'TELEGRAM'
  | 'WEBSITE';

export type SkillCategory =
  | 'DATABASE'
  | 'FRAMEWORK'
  | 'INFRA'
  | 'LANGUAGE'
  | 'OTHER'
  | 'RUNTIME'
  | 'TOOL';

export type ProfileLink = {
  kind: LinkKind;
  label: string;
  url: string;
  sortOrder: number;
};

export type Skill = {
  name: string;
  category: SkillCategory;
};

export type Achievement = {
  text: string;
};

export type Experience = {
  company: string;
  companyUrl: string | null;
  position: string;
  period: string;
  isCurrent: boolean;
  achievements: Achievement[];
};

export type Project = {
  name: string;
  description: string;
  url: string | null;
  repoUrl: string | null;
  skills: Skill[];
};

export type Profile = {
  name: string;
  headline: string;
  description: string;
  location: string | null;
  links: ProfileLink[];
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
};
