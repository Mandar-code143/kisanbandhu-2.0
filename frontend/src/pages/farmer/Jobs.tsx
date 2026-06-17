import { useNavigate } from 'react-router-dom';
import { PageHeader, StatusBadge, EmptyState } from '@/components/shared/SharedComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Calendar, Users, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { demoJobs } from '@/lib/demo-data';

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
  urgency: string;
  created_at: string | null;
}

interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: string;
  applied_at: string | null;
  worker_notes: string | null;
}

function mapDemoJobs(currentUserId?: string): DbJob[] {
  return demoJobs
    .filter(job => job.farmerId === 'f1' || job.farmerId === currentUserId)
    .map(job => {
      const [village, districtFallback] = job.location.split(',').map(part => part.trim());

      return {
        id: job.id,
        title: job.title,
        work_type: job.workType,
        crop_type: job.cropType,
        village: village || job.location,
        district: job.district || districtFallback || null,
        work_date: job.date,
        duration: job.duration,
        workers_needed: job.workersNeeded,
        workers_accepted: job.workersAccepted,
        wage_amount: job.wage,
        wage_type: job.wageType,
        food_included: job.foodIncluded,
        transport_included: job.transportIncluded,
        status: job.status,
        urgency: job.urgency,
        created_at: job.postedAt,
      };
    });
}

export default function FarmerJobs() {
  const navigate = useNavigate();
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      setJobs(mapDemoJobs());
      setLoading(false);
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) {
        setJobs(mapDemoJobs(user.id));
        setApplications([]);
        setLoading(false);
      }
    }, 350);

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('farmer_id', user.id)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (jobsData && jobsData.length > 0) {
          setJobs(jobsData);
          const jobIds = jobsData.map(j => j.id);
          if (jobIds.length > 0) {
            const { data: appsData } = await supabase
              .from('job_applications')
              .select('*')
              .in('job_id', jobIds);
            if (!cancelled && appsData) setApplications(appsData);
          }
        } else {
          setJobs(mapDemoJobs(user.id));
          setApplications([]);
        }
      } catch (error: any) {
        if (!cancelled) {
          setJobs(mapDemoJobs(user.id));
          setApplications([]);
          toast({ title: 'Using demo jobs', description: error?.message || 'Could not load live jobs yet.' });
        }
      } finally {
        window.clearTimeout(fallbackTimer);
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    // Realtime for new applications
    const channel = supabase
      .channel('farmer-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      supabase.removeChannel(channel);
    };
  }, [toast, user?.id]);

  const handleApplication = async (appId: string, action: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('job_applications')
      .update({ status: action, responded_at: new Date().toISOString() })
      .eq('id', appId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: action } : a));
      toast({ title: action === 'accepted' ? '✅ Worker Accepted' : '❌ Application Rejected' });
    }
  };

  const filtered = jobs.filter(j => {
    if (filter !== 'all' && j.status !== filter) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filterLabel = (value: string) => {
    if (value === 'all') return t('common.all', language);
    if (value === 'open') return t('status.open', language);
    if (value === 'in_progress') return t('status.inProgress', language);
    return t('status.completed', language);
  };

  const jobApps = (jobId: string) => applications.filter(a => a.job_id === jobId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('jobs.myJobs', language)} description={t('jobs.managePostings', language)}>
        <Button onClick={() => navigate('/farmer/jobs/new')} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
          <Plus className="h-4 w-4" /> {t('jobs.postNew', language)}
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder={t('jobs.search', language)} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'in_progress', 'completed'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className={`text-xs capitalize ${filter === f ? 'bg-primary text-primary-foreground' : ''}`}>
              {filterLabel(f)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(job => {
          const apps = jobApps(job.id);
          const pendingApps = apps.filter(a => a.status === 'pending');
          const isExpanded = selectedJob === job.id;

          return (
            <div key={job.id} className="rounded-xl border border-border bg-card shadow-card">
              <div className="p-4 cursor-pointer hover:bg-muted/30" onClick={() => setSelectedJob(isExpanded ? null : job.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{job.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {job.village}, {job.district}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingApps.length > 0 && (
                      <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-xs font-bold">
                        {pendingApps.length} new
                      </span>
                    )}
                    <StatusBadge status={job.status} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {job.work_date || '—'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.workers_accepted}/{job.workers_needed}</span>
                  <span className="font-semibold text-foreground">₹{job.wage_amount}/{job.wage_type === 'daily' ? t('common.day', language) : t('common.hourShort', language)}</span>
                  {job.food_included && <span className="rounded-full bg-success/10 text-success px-2 py-0.5 font-medium">{t('jobs.food', language)}</span>}
                </div>
              </div>

              {/* Applications panel */}
              {isExpanded && apps.length > 0 && (
                <div className="border-t border-border px-4 py-3 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Applications ({apps.length})</p>
                  {apps.map(app => (
                    <div key={app.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">Worker</p>
                        <p className="text-xs text-muted-foreground">
                          Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                          {app.worker_notes && ` • "${app.worker_notes}"`}
                        </p>
                      </div>
                      {app.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs bg-success text-success-foreground hover:bg-success/90" onClick={(e) => { e.stopPropagation(); handleApplication(app.id, 'accepted'); }}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleApplication(app.id, 'rejected'); }}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold ${app.status === 'accepted' ? 'text-success' : 'text-destructive'}`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isExpanded && apps.length === 0 && (
                <div className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
                  No applications yet
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState icon={Search} title={t('jobs.noneFound', language)} description={t('jobs.tryDifferentSearch', language)} action={<Button onClick={() => navigate('/farmer/jobs/new')} className="bg-primary text-primary-foreground">{t('jobs.postNew', language)}</Button>} />
        )}
      </div>
    </div>
  );
}
