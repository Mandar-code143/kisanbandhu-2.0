import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuickAction, StatusBadge } from '@/components/shared/SharedComponents';
import { SEOHead } from '@/components/SEOHead';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { motion } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import { GlowCard } from '@/components/animations/GlowCard';
import {
  Briefcase, Calendar, Wallet, Star, Search, Clock,
  CheckCircle2, ArrowRight, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WorkerDashboard() {
  const { user, language } = useAuth();
  const navigate = useNavigate();

  // Fetch available jobs
  const { data: availableJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['available-jobs'],
    queryFn: async () => {
      const { data } = await supabase.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(10);
      return data || [];
    },
  });

  // Fetch worker's applications
  const { data: myApplications = [] } = useQuery({
    queryKey: ['worker-applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('job_applications').select('*').eq('worker_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const completedCount = myApplications.filter(a => a.status === 'accepted').length;
  const upcomingCount = myApplications.filter(a => a.status === 'pending').length;

  if (jobsLoading) return <><SEOHead title="Dashboard" /><DashboardSkeleton /></>;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <SEOHead title="Worker Dashboard" description="Find farm jobs, track earnings, and manage your schedule on KrushiConnect." />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl bg-gradient-warm p-6 text-accent-foreground relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-foreground/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-medium text-accent-foreground/70">{t('dashboard.welcome', language)}</motion.p>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="mt-1 text-2xl font-bold">{user?.name}</motion.h1>
          <p className="mt-2 text-sm text-accent-foreground/70">{availableJobs.length} {t('dash.newJobsNear', language)}</p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: Search, label: t('dash.findWork', language), to: '/worker/jobs' },
              { icon: UserCheck, label: t('dash.updateProfile', language), to: '/worker/profile' },
            ].map((btn, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" onClick={() => navigate(btn.to)} className="bg-accent-foreground/15 text-accent-foreground hover:bg-accent-foreground/25 gap-1.5 backdrop-blur-sm border border-accent-foreground/10">
                  <btn.icon className="h-3.5 w-3.5" /> {btn.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-4" staggerDelay={0.08}>
        {[
          { icon: Briefcase, label: t('dash.jobsCompleted', language), value: completedCount, trend: completedCount > 0 ? `${completedCount} accepted` : undefined, trendUp: true },
          { icon: Wallet, label: t('dash.thisMonthEarnings', language), value: '₹0' },
          { icon: Star, label: t('dash.rating', language), value: user?.rating ? `${user.rating} ★` : 'N/A' },
          { icon: Calendar, label: t('dash.upcomingJobs', language), value: upcomingCount },
        ].map((stat, i) => (
          <StaggerItem key={i}>
            <GlowCard className="border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <motion.div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10" whileHover={{ rotate: 10, scale: 1.1 }}>
                  <stat.icon className="h-5 w-5 text-primary" />
                </motion.div>
                {stat.trend && (
                  <span className="text-xs font-semibold text-success">↑ {stat.trend}</span>
                )}
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </GlowCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <ScrollReveal>
        <h2 className="mb-3 text-base font-bold text-foreground">{t('dashboard.quickActions', language)}</h2>
        <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-4" staggerDelay={0.06}>
          {[
            { icon: Search, label: t('dash.findWork', language), description: t('dash.browseJobs', language), onClick: () => navigate('/worker/jobs'), variant: 'primary' as const },
            { icon: Calendar, label: t('dash.mySchedule', language), description: t('dash.manageAvailability', language), onClick: () => navigate('/worker/bookings'), variant: 'default' as const },
            { icon: Wallet, label: t('nav.earnings', language), description: t('dash.trackIncome', language), onClick: () => navigate('/worker/earnings'), variant: 'accent' as const },
            { icon: Star, label: t('dash.reviews', language), description: t('dash.seeRatings', language), onClick: () => navigate('/worker/profile'), variant: 'default' as const },
          ].map((action, i) => (
            <StaggerItem key={i}>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <QuickAction {...action} />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </ScrollReveal>

      <ScrollReveal>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">{t('dash.jobsNearYou', language)}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/worker/jobs')} className="text-xs text-primary gap-1">
            {t('common.viewAll', language)} <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        {availableJobs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No jobs available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableJobs.slice(0, 4).map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-elevated)' }}
                className="rounded-xl border border-border bg-card p-4 shadow-card cursor-pointer"
                onClick={() => navigate(`/worker/jobs/${job.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{job.village}, {job.district}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{job.wage_amount}</p>
                    <p className="text-[10px] text-muted-foreground">{job.wage_type === 'daily' ? t('dash.perDay', language) : t('dash.perHour', language)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.work_date || 'TBD'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.duration}</span>
                  {job.food_included && <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-[10px] font-medium">{t('jobPost.food', language)}</span>}
                  {job.transport_included && <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">{t('jobPost.transport', language)}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{job.work_type}</span>
                  <StatusBadge status={job.urgency === 'normal' ? 'open' : job.urgency} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollReveal>

      <ScrollReveal>
        <GlowCard className="border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">{t('dash.profileCompletion', language)}</h3>
              <p className="text-xs text-muted-foreground">{t('dash.completeProfile', language)}</p>
            </div>
            <span className="text-lg font-bold text-primary">{user?.verified ? '100%' : '60%'}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div className="h-2 rounded-full bg-primary" initial={{ width: 0 }} whileInView={{ width: user?.verified ? '100%' : '60%' }} viewport={{ once: true }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { label: t('dash.basicInfo', language), done: !!user?.name },
              { label: t('dash.skills', language), done: !!user?.skills },
              { label: t('dash.idVerified', language), done: !!user?.verified },
              { label: t('dash.bankDetails', language), done: false },
              { label: t('dash.photo', language), done: !!user?.avatarUrl },
            ].map((item, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.08 }}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${item.done ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {item.done ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />} {item.label}
              </motion.span>
            ))}
          </div>
        </GlowCard>
      </ScrollReveal>
    </div>
  );
}
