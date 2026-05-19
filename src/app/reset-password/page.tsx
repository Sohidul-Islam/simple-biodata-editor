import ResetPasswordClient from './ResetPasswordClient';

interface ResetPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({ searchParams }: ResetPageProps) {
  const { token } = await searchParams;
  return <ResetPasswordClient token={token || ''} />;
}
