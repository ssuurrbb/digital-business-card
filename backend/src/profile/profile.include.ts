import type { GraphQLResolveInfo } from 'graphql';
import {
  isRequested,
  requestedFields,
  type FieldTree,
} from '../common/graphql/requested-fields';

export function profileInclude(info: GraphQLResolveInfo) {
  const fields = requestedFields(info);
  const experience = (fields.experience ?? {}) as FieldTree;
  const projects = (fields.projects ?? {}) as FieldTree;

  return {
    links: isRequested(fields, 'links')
      ? { orderBy: { sortOrder: 'asc' as const } }
      : false,
    skills: isRequested(fields, 'skills')
      ? {
          orderBy: { sortOrder: 'asc' as const },
          include: { skill: true as const },
        }
      : false,
    experiences: isRequested(fields, 'experience')
      ? {
          orderBy: [
            { sortOrder: 'asc' as const },
            { startDate: 'desc' as const },
          ],
          include: {
            achievements: isRequested(experience, 'achievements')
              ? { orderBy: { sortOrder: 'asc' as const } }
              : false,
          },
        }
      : false,
    projects: isRequested(fields, 'projects')
      ? {
          orderBy: { sortOrder: 'asc' as const },
          include: {
            skills: isRequested(projects, 'skills')
              ? {
                  include: { skill: true as const },
                  orderBy: { skill: { name: 'asc' as const } },
                }
              : false,
          },
        }
      : false,
  };
}

export type ProfileInclude = ReturnType<typeof profileInclude>;

export const fullProfileInclude = {
  links: { orderBy: { sortOrder: 'asc' as const } },
  skills: {
    orderBy: { sortOrder: 'asc' as const },
    include: { skill: true as const },
  },
  experiences: {
    orderBy: [
      { sortOrder: 'asc' as const },
      { startDate: 'desc' as const },
    ],
    include: {
      achievements: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
  projects: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      skills: {
        include: { skill: true as const },
        orderBy: { skill: { name: 'asc' as const } },
      },
    },
  },
} satisfies ProfileInclude;
