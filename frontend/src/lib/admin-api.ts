import type { LinkKind, SkillCategory } from '@/types';

export const TOKEN_KEY = 'admin-token';

export class AdminAuthError extends Error {}

export type AdminSkill = {
  id: string;
  name: string;
  category: SkillCategory;
};

export type AdminLink = {
  id: string;
  kind: LinkKind;
  label: string;
  url: string;
  sortOrder: number;
};

export type AdminAchievement = {
  id: string;
  text: string;
  sortOrder: number;
};

export type AdminExperience = {
  id: string;
  company: string;
  companyUrl: string | null;
  position: string;
  startDate: string;
  endDate: string | null;
  period: string;
  isCurrent: boolean;
  sortOrder: number;
  achievements: AdminAchievement[];
};

export type AdminProject = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  repoUrl: string | null;
  sortOrder: number;
  skills: AdminSkill[];
};

export type AdminProfile = {
  id: string;
  name: string;
  headline: string;
  description: string;
  location: string | null;
  links: AdminLink[];
  skills: AdminSkill[];
  experience: AdminExperience[];
  projects: AdminProject[];
};

export type AdminBundle = {
  profile: AdminProfile;
  skills: AdminSkill[];
};

export const LINK_KINDS: { value: LinkKind; label: string }[] = [
  { value: 'EMAIL', label: 'Почта' },
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'HH', label: 'HeadHunter' },
  { value: 'WEBSITE', label: 'Сайт' },
  { value: 'OTHER', label: 'Другое' },
];

export const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'LANGUAGE', label: 'Язык' },
  { value: 'RUNTIME', label: 'Runtime' },
  { value: 'FRAMEWORK', label: 'Фреймворк' },
  { value: 'DATABASE', label: 'База данных' },
  { value: 'INFRA', label: 'Инфра' },
  { value: 'TOOL', label: 'Инструмент' },
  { value: 'OTHER', label: 'Другое' },
];

const ADMIN_QUERY = `
  query AdminBundle {
    profile {
      id
      name
      headline
      description
      location
      links { id kind label url sortOrder }
      skills { id name category }
      experience {
        id
        company
        companyUrl
        position
        startDate
        endDate
        period
        isCurrent
        sortOrder
        achievements { id text sortOrder }
      }
      projects {
        id
        name
        description
        url
        repoUrl
        sortOrder
        skills { id name category }
      }
    }
    skills { id name category }
  }
`;

type GraphQLPayload<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

function isAuthFailure(message: string): boolean {
  return (
    message === 'Invalid admin key' ||
    message === 'Unauthorized' ||
    message === 'Admin API is not configured' ||
    message.toLowerCase().includes('unauthorized')
  );
}

export async function graphql<T>(
  graphqlUrl: string,
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    accept: 'application/json',
  };
  if (token) {
    headers['x-admin-key'] = token;
  }

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 401) {
    throw new AdminAuthError('Сессия истекла, войдите снова');
  }
  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLPayload<T>;
  const message = payload.errors?.[0]?.message;
  if (message) {
    if (isAuthFailure(message)) {
      throw new AdminAuthError('Сессия истекла, войдите снова');
    }
    throw new Error(message);
  }
  if (!payload.data) {
    throw new Error('Пустой ответ API');
  }
  return payload.data;
}

export async function login(
  graphqlUrl: string,
  loginValue: string,
  password: string,
): Promise<string> {
  const data = await graphql<{ login: { token: string } }>(
    graphqlUrl,
    `mutation Login($input: LoginInput!) {
      login(input: $input) { token }
    }`,
    { input: { login: loginValue, password } },
  );
  return data.login.token;
}

export async function checkSession(
  graphqlUrl: string,
  token: string,
): Promise<void> {
  await graphql<{ adminSession: boolean }>(
    graphqlUrl,
    `query AdminSession { adminSession }`,
    undefined,
    token,
  );
}

export async function loadAdmin(
  graphqlUrl: string,
  token: string,
): Promise<AdminBundle> {
  return graphql<AdminBundle>(graphqlUrl, ADMIN_QUERY, undefined, token);
}

export function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function optionalTextOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toDateInput(value: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toIsoDate(value: string): string {
  return `${value}T00:00:00.000Z`;
}

export function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
