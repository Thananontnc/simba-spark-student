import { auth, signOut } from '@/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import StudentSidebar from './sidebar';
import { getStudentDashboardData } from '@/lib/student-db';
import { redirect } from 'next/navigation';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const data = await getStudentDashboardData(session.user.email);
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error: Student profile not found in database.</p>
      </div>
    );
  }

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', color: 'var(--tx)' }}>
      <StudentSidebar data={data} signOutAction={handleSignOut} />

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-12 flex items-center justify-between px-4 shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          {/* Mobile brand (hidden on desktop) */}
          <div className="flex items-center gap-2 lg:hidden pl-10">
            <span className="text-xs font-semibold" style={{ color: 'var(--tx)' }}>
              Simba Spark
            </span>
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
