import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import {
  LayoutDashboard, Users, ShieldCheck, Briefcase, Tractor,
  FileText, BarChart3, Megaphone, AlertTriangle, Settings
} from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/verification', label: 'Verification', icon: ShieldCheck },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/equipment', label: 'Equipment', icon: Tractor },
  { to: '/admin/schemes', label: 'Schemes', icon: FileText },
  { to: '/admin/ads', label: 'Ads', icon: Megaphone },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-card/50 lg:block">
          <nav className="sticky top-16 flex flex-col gap-0.5 p-3 pt-4">
            {adminNav.map(item => {
              const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to + '/') || location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 overflow-x-hidden">
          <div className="container max-w-7xl py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
