import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, StatusBadge } from '@/components/shared/SharedComponents';
import { SEOHead } from '@/components/SEOHead';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star, MapPin, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WorkerDiscovery() {
  const { language } = useAuth();
  const [search, setSearch] = useState('');
  const [showVerified, setShowVerified] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [hired, setHired] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: workers = [], isLoading } = useQuery({
    queryKey: ['worker-profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .order('rating', { ascending: false });
      return data || [];
    },
  });

  const filtered = workers.filter(w => {
    if (showVerified && !w.verified) return false;
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = (w.full_name || '').toLowerCase().includes(q);
      const skillMatch = (w.skills || '').toLowerCase().includes(q);
      if (!nameMatch && !skillMatch) return false;
    }
    return true;
  });

  const handleSave = (id: string, name: string) => {
    if (saved.includes(id)) {
      setSaved(prev => prev.filter(s => s !== id));
      toast({ title: "Removed from Saved", description: `${name} removed from your saved workers.` });
    } else {
      setSaved(prev => [...prev, id]);
      toast({ title: "Worker Saved!", description: `${name} added to your saved workers list.` });
    }
  };

  const handleHire = (id: string, name: string) => {
    setHired(prev => [...prev, id]);
    toast({ title: "Hire Request Sent!", description: `${name} has been notified. They'll respond within 24 hours.` });
  };

  if (isLoading) return <><SEOHead title="Find Workers" /><DashboardSkeleton /></>;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <SEOHead title="Find Workers" description="Discover and hire verified agricultural workers near you on KrushiConnect." />
      <PageHeader title={t('dash.findWorkers', language)} description={`${filtered.length} workers available`} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name, skill..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant={showVerified ? 'default' : 'outline'} size="sm" onClick={() => setShowVerified(!showVerified)} className={`gap-1.5 text-xs ${showVerified ? 'bg-primary text-primary-foreground' : ''}`}>
          <Filter className="h-3.5 w-3.5" /> Verified Only
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No workers found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(worker => {
            const skills = worker.skills ? worker.skills.split(',').map(s => s.trim()) : [];
            return (
              <div key={worker.id} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                    {(worker.full_name || '?').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-bold text-foreground">{worker.full_name}</h3>
                      {worker.verified && <span className="shrink-0 text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full font-semibold">✓ Verified</span>}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {worker.village || worker.district || 'Unknown'}</p>
                  </div>
                </div>

                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {skills.slice(0, 4).map(s => (
                      <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                  <div>
                    <p className="font-bold text-foreground">{worker.experience_years || 0}yr</p>
                    <p className="text-muted-foreground">Exp</p>
                  </div>
                  <div>
                    <p className="flex items-center justify-center gap-0.5 font-bold text-foreground"><Star className="h-3 w-3 fill-accent text-accent" /> {Number(worker.rating) || 0}</p>
                    <p className="text-muted-foreground">{worker.review_count || 0} reviews</p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">₹{worker.daily_wage || 0}</p>
                    <p className="text-muted-foreground">/day</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status="active" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className={`text-xs h-8 ${saved.includes(worker.id) ? 'border-primary text-primary' : ''}`}
                      onClick={() => handleSave(worker.id, worker.full_name)}>
                      {saved.includes(worker.id) ? '♥ Saved' : 'Save'}
                    </Button>
                    {hired.includes(worker.id) ? (
                      <span className="flex items-center text-xs font-semibold text-success">Requested ✓</span>
                    ) : (
                      <Button size="sm" className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleHire(worker.id, worker.full_name)}>
                        Hire
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
