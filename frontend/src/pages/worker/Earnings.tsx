import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, StatCard } from '@/components/shared/SharedComponents';
import { SEOHead } from '@/components/SEOHead';
import { Wallet, TrendingUp, Briefcase, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkerEarnings() {
  const { user, language } = useAuth();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['worker-earnings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('job_applications')
        .select('*, jobs(*)')
        .eq('worker_id', user.id)
        .eq('status', 'accepted')
        .order('applied_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate earnings from accepted jobs
  const totalEarnings = applications.reduce((sum: number, app: any) => {
    const job = app.jobs;
    if (!job) return sum;
    return sum + (job.wage_amount || 0);
  }, 0);

  const jobsDone = applications.length;

  // Simple chart data based on actual data
  const chartData = [
    { month: 'Total', earnings: totalEarnings },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <SEOHead title="Earnings" description="Track your earnings and payment history on KrushiConnect." />
      <PageHeader title={t('earn.title', language)} description={t('earn.desc', language)} />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard icon={Wallet} label={t('earn.totalEarned', language)} value={`₹${totalEarnings.toLocaleString()}`} />
            <StatCard icon={Briefcase} label={t('earn.jobsDone', language)} value={jobsDone} />
            <StatCard icon={TrendingUp} label={t('earn.thisMonth', language)} value={`₹${totalEarnings.toLocaleString()}`} />
            <StatCard icon={Calendar} label={t('earn.pendingPay', language)} value="₹0" />
          </div>

          {applications.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="mb-3 text-sm font-bold text-foreground">{t('earn.recentPayments', language)}</h3>
              <div className="space-y-2">
                {applications.slice(0, 10).map((app: any, i: number) => {
                  const job = app.jobs;
                  if (!job) return null;
                  return (
                    <div key={app.id} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.work_type} • {job.work_date || 'TBD'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">₹{job.wage_amount?.toLocaleString()}</p>
                        <span className="text-[10px] font-semibold text-success">{t('earn.paid', language)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {applications.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Wallet className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No earnings yet. Apply for and complete jobs to start earning!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
