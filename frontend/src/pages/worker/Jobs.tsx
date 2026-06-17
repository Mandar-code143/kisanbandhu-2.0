import { PageHeader } from '@/components/shared/SharedComponents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

interface DbJob {
  id: string;
  title: string;
  work_type: string;
  crop_type: string;
  village: string | null;
  district: string | null;
  work_date: string | null;
  duration: string | null;
  workers_needed: number;
  workers_accepted: number;
  wage_amount: number;
  wage_type: string;
  food_included: boolean | null;
  transport_included: boolean | null;
  status: string;
  farmer_id: string;
}

export default function WorkerJobs() {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { language, user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (jobsData) setJobs(jobsData);

      // Fetch user's existing applications
      if (user?.id) {
        const { data: appsData } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('worker_id', user.id);
        if (appsData) setAppliedJobIds(appsData.map(a => a.job_id));
      }
      setLoading(false);
    };
    fetchJobs();

    // Realtime for new jobs
    const channel = supabase
      .channel('worker-jobs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
        const newJob = payload.new as DbJob;
        if (newJob.status === 'open') setJobs(prev => [newJob, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const filtered = jobs.filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.work_type.toLowerCase().includes(search.toLowerCase()));

  const handleApply = async (jobId: string, jobTitle: string) => {
    if (!user?.id) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('job_applications').insert({
      job_id: jobId,
      worker_id: user.id,
      status: 'pending',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setAppliedJobIds(prev => [...prev, jobId]);
    toast({
      title: t('workerJobs.applicationSent', language),
      description: `${t('workerJobs.appliedFor', language)} "${jobTitle}". ${t('workerJobs.waitForResponse', language)}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('nav.findWork', language)} description={`${filtered.length} ${t('workerJobs.jobsAvailableNear', language)}`} />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder={t('workerJobs.searchPlaceholder', language)} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="space-y-3">
        {filtered.map(job => (
          <div key={job.id} className="rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-elevated">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <MapPin className="inline h-3 w-3" /> {job.village}, {job.district}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-foreground">₹{job.wage_amount}</p>
                <p className="text-[10px] text-muted-foreground">/{job.wage_type === 'daily' ? t('common.day', language) : t('common.hourShort', language)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.work_date || '—'}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.duration}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.workers_needed - job.workers_accepted} {t('workerJobs.spotsLeft', language)}</span>
              {job.food_included && <span className="rounded-full bg-success/10 text-success px-2 py-0.5 font-medium">{t('jobs.food', language)}</span>}
              {job.transport_included && <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">{t('workerJobs.transport', language)}</span>}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-1">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{job.work_type}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{job.crop_type}</span>
              </div>
              {appliedJobIds.includes(job.id) ? (
                <span className="text-xs font-semibold text-success flex items-center gap-1">✓ {t('workerJobs.applied', language)}</span>
              ) : (
                <Button size="sm" className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); handleApply(job.id, job.title); }}>
                  {t('workerJobs.applyNow', language)}
                </Button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No jobs available right now</p>
            <p className="text-xs">Check back later for new postings</p>
          </div>
        )}
      </div>
    </div>
  );
}
