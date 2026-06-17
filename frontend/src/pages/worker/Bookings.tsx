import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/SharedComponents';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, XCircle, MapPin, Phone, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export default function WorkerBookings() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['worker-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('job_applications')
        .select('*, jobs(*)')
        .eq('worker_id', user.id)
        .order('applied_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const statusMap: Record<string, string> = {
    pending: t('booking.invited', language),
    accepted: t('booking.accepted', language),
    rejected: t('booking.rejected', language),
  };

  const filtered = filter === 'all' ? applications : applications.filter((a: any) => a.status === filter);

  const acceptedCount = applications.filter((a: any) => a.status === 'accepted').length;
  const pendingCount = applications.filter((a: any) => a.status === 'pending').length;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <SEOHead title="My Bookings" description="Track your job applications and upcoming work on KrushiConnect." />
      <PageHeader title={t('booking.title', language)} description={`${acceptedCount} ${t('booking.upcoming', language)}, ${pendingCount} ${t('booking.pending', language)}`} />

      <div className="flex gap-2 overflow-x-auto">
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className={`shrink-0 text-xs ${filter === f ? 'bg-primary text-primary-foreground' : ''}`}>
            {f === 'all' ? t('booking.all', language) : statusMap[f]} {f !== 'all' && `(${applications.filter((a: any) => a.status === f).length})`}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {filter === 'all' ? "No bookings yet. Apply for jobs to see them here!" : `No ${filter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => {
            const job = app.jobs;
            if (!job) return null;
            return (
              <div key={app.id} className={`rounded-xl border bg-card p-4 shadow-card ${app.status === 'pending' ? 'border-accent/30 bg-accent/5' : 'border-border'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
                    <p className="text-xs text-muted-foreground">{job.crop_type} • {job.work_type}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    app.status === 'accepted' ? 'bg-success/10 text-success border border-success/20' :
                    app.status === 'pending' ? 'bg-accent/10 text-accent border border-accent/20' :
                    'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>{statusMap[app.status] || app.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.work_date || 'TBD'}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.village}, {job.district}</span>
                  <span className="font-semibold text-foreground">₹{job.wage_amount}/{job.wage_type === 'daily' ? t('common.day', language) : t('common.hourShort', language)}</span>
                </div>
                {app.status === 'accepted' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <Phone className="h-3.5 w-3.5" /> Call Farmer
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
