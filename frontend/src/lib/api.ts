import { cache } from 'react';
import type { Profile } from '@/types';

const PROFILE_QUERY = `
  query ProfileCard {
    profile {
      name
      headline
      description
      location
      links {
        kind
        label
        url
        sortOrder
      }
      skills {
        name
        category
      }
      experience {
        company
        companyUrl
        position
        period
        isCurrent
        achievements {
          text
        }
      }
      projects {
        name
        description
        url
        repoUrl
        skills {
          name
          category
        }
      }
    }
  }
`;

type GraphQLResponse = {
  data?: { profile: Profile };
  errors?: Array<{ message: string }>;
};

function graphqlUrl(): string {
  const url = process.env.GRAPHQL_URL;
  if (!url) {
    throw new Error('GRAPHQL_URL is not set');
  }
  return url;
}

export const getProfile = cache(async (): Promise<Profile> => {
  const response = await fetch(graphqlUrl(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ query: PROFILE_QUERY }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse;
  const message = payload.errors?.[0]?.message;
  if (message) {
    throw new Error(message);
  }
  if (!payload.data?.profile) {
    throw new Error('Profile is empty');
  }

  return payload.data.profile;
});
