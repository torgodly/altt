import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AdminDashboard } from '@/components/AdminDashboard';

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session.user) {
    redirect('/admin/login');
  }
  return <AdminDashboard />;
}
