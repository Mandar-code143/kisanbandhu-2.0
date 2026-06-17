import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatCard, QuickAction, StatusBadge } from '@/components/shared/SharedComponents';
import { SEOHead } from '@/components/SEOHead';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { motion } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import { GlowCard } from '@/components/animations/GlowCard';
import {
  Briefcase, Users, Tractor, Cloud, Plus, Search,
  Star, Calendar, TrendingUp, MapPin, Clock, ArrowRight,
  AlertTriangle, Phone, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FarmerDashboard() {
  const { user, language } = useAuth();
  const navigate = useNavigate();

  const { data: myJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['farmer-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('jobs').select('*').eq('farmer_id', user.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: applicationCount = 0 } = useQuery({
    queryKey: ['farmer-app-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('job_applications')
        .select('*, jobs!inner(farmer_id)', { count: 'exact', head: true })
        .eq('jobs.farmer_id', user.id)
        .eq('status', 'accepted');
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const activeJobs = myJobs.filter(j => j.status === 'open' || j.status === 'in_progress');
  const totalSpend = myJobs.reduce((sum, j) => sum + (j.wage_amount * j.workers_accepted), 0);

  if (jobsLoading) return <><SEOHead title="Dashboard" /><DashboardSkeleton /></>;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <SEOHead title="Farmer Dashboard" description="Manage your farm jobs, hire workers, and track spending on KrushiConnect." />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-sm font-medium text-primary-foreground/70">
                {t('dashboard.welcome', language)}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="mt-1 text-2xl font-bold">
                {user?.name}
              </motion.h1>
              <p className="mt-1 text-sm text-primary-foreground/70">{t('dash.rabiActive', language)} • {user?.village}, {user?.district}</p>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: Plus, label: t('dash.postNewJob', language), to: '/farmer/jobs/new' },
              { icon: Search, label: t('dash.findWorkers', language), to: '/farmer/workers' },
              { icon: Phone, label: t('nav.ivrCalls', language), to: '/farmer/ivr' },
            ].map((btn, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" onClick={() => navigate(btn.to)} className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 gap-1.5 backdrop-blur-sm border border-primary-foreground/10">
                  <btn.icon className="h-3.5 w-3.5" /> {btn.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Weather Alert */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
        className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{t('dash.heavyRain', language)}</p>
          <p className="text-xs text-muted-foreground">{t('dash.secureCrops', language)} <button onClick={() => navigate('/farmer/weather')} className="text-primary font-medium hover:underline">{t('dash.viewForecast', language)}</button></p>
        </div>
      </motion.div>

      {/* Stats from DB */}
      <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-4" staggerDelay={0.08}>
        {[
          { icon: Briefcase, label: t('dash.activeJobs', language), value: activeJobs.length, trend: activeJobs.length > 0 ? `${activeJobs.length} live` : undefined, trendUp: true },
          { icon: Users, label: t('dash.workersHired', language), value: applicationCount, trend: applicationCount > 0 ? `${applicationCount} accepted` : undefined, trendUp: true },
          { icon: Tractor, label: t('dash.equipmentListed', language), value: 0 },
          { icon: TrendingUp, label: t('dash.monthlySpend', language), value: `₹${totalSpend.toLocaleString()}` },
        ].map((stat, i) => (
          <StaggerItem key={i}>
            <GlowCard className="border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <motion.div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10" whileHover={{ rotate: 10, scale: 1.1 }}>
                  <stat.icon className="h-5 w-5 text-primary" />
                </motion.div>
                {stat.trend && (
                  <span className={`text-xs font-semibold ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trendUp ? '↑' : '↓'} {stat.trend}
                  </span>
                )}
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </GlowCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Quick Actions */}
      <ScrollReveal>
        <h2 className="mb-3 text-base font-bold text-foreground">{t('dashboard.quickActions', language)}</h2>
        <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-4" staggerDelay={0.06}>
          {[
            { icon: Plus, label: t('dash.postJob', language), description: t('dash.createListing', language), onClick: () => navigate('/farmer/jobs/new'), variant: 'primary' as const },
            { icon: Users, label: t('dash.browseWorkers', language), description: t('dash.findAvailable', language), onClick: () => navigate('/farmer/workers'), variant: 'default' as const },
            { icon: Tractor, label: t('nav.equipment', language), description: t('dash.rentEquipment', language), onClick: () => navigate('/farmer/equipment'), variant: 'default' as const },
            { icon: Cloud, label: t('nav.weather', language), description: t('dash.checkForecast', language), onClick: () => navigate('/farmer/weather'), variant: 'accent' as const },
          ].map((action, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <QuickAction {...action} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </ScrollReveal>

      {/* Active Jobs from DB */}
      <ScrollReveal>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{t('dash.activeJobsTitle', language)}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/farmer/jobs')} className="text-xs text-primary gap-1">
            {t('common.viewAll', language)} <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        {activeJobs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No active jobs yet. Post your first job!</p>
            <Button size="sm" className="mt-3" onClick={() => navigate('/farmer/jobs/new')}>
              <Plus className="h-4 w-4 mr-1" /> Post a Job
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.slice(0, 3).map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-elevated)' }}
                className="rounded-xl border border-border bg-card p-4 shadow-card cursor-pointer"
                onClick={() => navigate(`/farmer/jobs/${job.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {job.village}, {job.district}</p>
                  </div>
                  <StatusBadge status={job.urgency === 'normal' ? job.status : job.urgency} />
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.work_date || 'TBD'}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.workers_accepted}/{job.workers_needed} {t('dash.workers', language)}</span>
                  <span className="font-semibold text-foreground">₹{job.wage_amount}/{job.wage_type === 'daily' ? t('common.day', language) : t('common.hourShort', language)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}
