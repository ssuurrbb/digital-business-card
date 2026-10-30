import type { Metadata } from 'next';
import { Card } from '@/components/card';
import { getProfile } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await getProfile();
    return {
      title: `${profile.name} — ${profile.headline}`,
      description: profile.description,
    };
  } catch {
    return { title: 'Визитка' };
  }
}

export default async function HomePage() {
  const profile = await getProfile();
  return <Card profile={profile} />;
}
