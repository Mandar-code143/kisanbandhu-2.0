import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import { t } from '@/lib/i18n';
import {
  LayoutDashboard, Briefcase, Tractor, FileText, Cloud,
  Bell, User, Users, Calendar, Wallet, Phone
} from 'lucide-react';

export default function AppLayout() {
  const { user, isAuthenticated, isLoading, language } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const farmerNav = [
    { to: '/farmer', label: t('nav.dashboard', language), icon: LayoutDashboard, end: true },
    { to: '/farmer/jobs', label: t('nav.jobs', language), icon: Briefcase },
    { to: '/farmer/workers', label: t('nav.workers', language), icon: Users },
    { to: '/farmer/equipment', label: t('nav.equipment', language), icon: Tractor },
    { to: '/farmer/ivr', label: t('nav.ivrCalls', language), icon: Phone },
    { to: '/farmer/schemes', label: t('nav.schemes', language), icon: FileText },
    { to: '/farmer/weather', label: t('nav.weather', language), icon: Cloud },
    { to: '/farmer/notifications', label: t('nav.notifications', language), icon: Bell },
    { to: '/farmer/profile', label: t('nav.profile', language), icon: User },
  ];

  const workerNav = [
    { to: '/worker', label: t('nav.dashboard', language), icon: LayoutDashboard, end: true },
    { to: '/worker/jobs', label: t('nav.findWork', language), icon: Briefcase },
    { to: '/worker/bookings', label: t('nav.myJobs', language), icon: Calendar },
    { to: '/worker/earnings', label: t('nav.earnings', language), icon: Wallet },
    { to: '/worker/schemes', label: t('nav.schemes', language), icon: FileText },
    { to: '/worker/weather', label: t('nav.weather', language), icon: Cloud },
    { to: '/worker/notifications', label: t('nav.notifications', language), icon: Bell },
    { to: '/worker/profile', label: t('nav.profile', language), icon: User },
  ];

  const nav = user?.role === 'worker' ? workerNav : farmerNav;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card/50 lg:block">
          <nav className="sticky top-16 flex flex-col gap-0.5 p-3 pt-4">
            {nav.map(item => {
              const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-x-hidden">
          <div className="container max-w-6xl py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden">
        <nav className="flex justify-around px-2 py-1.5">
          {nav.slice(0, 5).map(item => {
            const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
