import { demoSchemes } from '@/lib/demo-data';
import { PageHeader, StatusBadge } from '@/components/shared/SharedComponents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Calendar, ArrowRight, Bookmark, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';

export default function Schemes() {
  const { language } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const catMap: Record<string, string> = {
    'All': t('scheme.all', language), 'Subsidy': t('scheme.subsidy', language),
    'Insurance': t('scheme.insurance', language), 'Employment': t('scheme.employment', language),
    'Irrigation': t('scheme.irrigation', language),
  };
  const categories = ['All', 'Subsidy', 'Insurance', 'Employment', 'Irrigation'];

  const filtered = demoSchemes.filter(s => {
    if (activeCat !== 'All' && s.category !== activeCat) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleBookmark = (id: string, title: string) => {
    if (bookmarked.includes(id)) {
      setBookmarked(prev => prev.filter(b => b !== id));
      toast({ title: t('scheme.removed', language), description: `${title} ${t('scheme.removedDesc', language)}` });
    } else {
      setBookmarked(prev => [...prev, id]);
      toast({ title: t('scheme.saved', language), description: `${title} ${t('scheme.savedDesc', language)}` });
    }
  };

  const getSchemeTitle = (scheme: typeof demoSchemes[0]) => {
    if (language === 'hi') return scheme.titleHi || scheme.title;
    if (language === 'mr') return scheme.titleMr || scheme.title;
    return scheme.title;
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('scheme.title', language)} description={`${filtered.length} ${t('scheme.available', language)}`} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder={t('scheme.search', language)} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <Button key={cat} size="sm" variant={activeCat === cat ? 'default' : 'outline'} onClick={() => setActiveCat(cat)} className={`shrink-0 text-xs ${activeCat === cat ? 'bg-primary text-primary-foreground' : ''}`}>
            {catMap[cat]}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(scheme => (
          <div key={scheme.id} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{getSchemeTitle(scheme)}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">{scheme.type}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{catMap[scheme.category] || scheme.category}</span>
                    <StatusBadge status={scheme.status} />
                  </div>
                </div>
              </div>
              <button onClick={() => toggleBookmark(scheme.id, getSchemeTitle(scheme))} className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${bookmarked.includes(scheme.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
                <Bookmark className={`h-4 w-4 ${bookmarked.includes(scheme.id) ? 'fill-primary' : ''}`} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{scheme.summary}</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('scheme.eligibility', language)}</p>
                <p className="mt-0.5 text-xs text-foreground">{scheme.eligibility}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('scheme.benefits', language)}</p>
                <p className="mt-0.5 text-xs text-foreground">{scheme.benefits}</p>
              </div>
            </div>

            {expanded === scheme.id && (
              <div className="mt-3 rounded-lg border border-border bg-background p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('scheme.documents', language)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {scheme.documents.map(d => (
                      <span key={d} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {scheme.lastDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {t('scheme.deadline', language)}: {scheme.lastDate}</span>}
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {scheme.documents.length} docs</span>
              </div>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}>
                {expanded === scheme.id ? t('common.back', language) : t('scheme.apply', language)} <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
