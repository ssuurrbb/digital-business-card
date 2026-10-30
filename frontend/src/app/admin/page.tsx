import { AdminApp } from '@/components/admin/admin-app';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const graphqlUrl =
    process.env.PUBLIC_GRAPHQL_URL ?? process.env.GRAPHQL_URL;
  if (!graphqlUrl) {
    throw new Error('GRAPHQL_URL is not set');
  }
  return <AdminApp graphqlUrl={graphqlUrl} />;
}
