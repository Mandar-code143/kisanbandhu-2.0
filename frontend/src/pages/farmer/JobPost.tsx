import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/shared/SharedComponents';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import VoiceField from '@/components/shared/VoiceField';
import VoiceInput from '@/components/shared/VoiceInput';
import {
  ArrowLeft, ArrowRight, CheckCircle2, MapPin, Calendar, Users, Banknote, FileText,
  Phone, PhoneCall, PhoneOff, PhoneIncoming, PhoneMissed, XCircle, Clock
} from 'lucide-react';

const workTypeKeys = ['harvesting','transplanting','weeding','plowing','spraying','picking','sorting','loading','pruning','irrigation','sowing'];
const cropTypeKeys = ['sugarcane','cotton','rice','wheat','soybean','onion','grape','tomato','potato','maize','jowar'];
const durationKeys = [
  { key: '1day', raw: '1 day' }, { key: '2days', raw: '2 days' }, { key: '3days', raw: '3 days' },
  { key: '5days', raw: '5 days' }, { key: '1week', raw: '1 week' },
];

const FAKE_WORKER_NAMES = [
  'Ramu Jadhav','Sunita Pawar','Ganesh More','Lakshmi Shinde','Babu Kale',
  'Savita Gaikwad','Ravi Bhosle','Anita Kamble','Suresh Mane','Pooja Salunkhe',
  'Vikas Thorat','Suman Nikam','Mahesh Wagh','Asha Chavan','Deepak Sonawane',
];
const FAKE_PHONES = [
  '98XXXX1234','97XXXX5678','96XXXX9012','95XXXX3456','94XXXX7890',
  '93XXXX2345','92XXXX6789','91XXXX0123','90XXXX4567','89XXXX8901',
  '88XXXX2345','87XXXX6789','86XXXX0123','85XXXX4567','84XXXX8901',
];

interface CallEntry {
  id: string; worker_name: string; worker_phone: string;
  status: string; language_selected: string | null; isReal: boolean;
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'queued': return <Clock className="h-4 w-4 text-muted-foreground" />;
    case 'calling': return <PhoneCall className="h-4 w-4 text-accent animate-pulse" />;
    case 'answered': return <PhoneIncoming className="h-4 w-4 text-primary" />;
    case 'accepted': return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'rejected': return <XCircle className="h-4 w-4 text-destructive" />;
    case 'unavailable': case 'no_response': return <PhoneMissed className="h-4 w-4 text-warning" />;
    case 'failed': return <PhoneOff className="h-4 w-4 text-destructive" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'accepted': return 'border-success/20 bg-success/10 text-success';
    case 'rejected': case 'failed': return 'border-destructive/20 bg-destructive/10 text-destructive';
    case 'calling': return 'border-accent/20 bg-accent/10 text-accent';
    case 'answered': return 'border-primary/20 bg-primary/10 text-primary';
    case 'no_response': case 'unavailable': return 'border-warning/20 bg-warning/10 text-warning';
    default: return 'border-border bg-muted text-muted-foreground';
  }
};

export default function JobPost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, language } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', workType: '', cropType: '', location: '',
    village: user?.village || '', district: user?.district || 'Pune',
    date: '', startTime: '07:00', duration: '1 day', workersNeeded: 4,
    genderPref: 'any', skillRequirements: [] as string[], experiencePref: 'any',
    wageType: 'daily' as 'daily' | 'hourly' | 'fixed', wageAmount: 450,
    foodIncluded: true, transportIncluded: false, toolsProvided: true,
    urgency: 'normal' as 'normal' | 'urgent' | 'critical',
    notes: '', contactPreference: 'app',
  });

  const [calls, setCalls] = useState<CallEntry[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [ivrRunning, setIvrRunning] = useState(false);
  const [ivrDone, setIvrDone] = useState(false);

  const updateForm = (updates: Partial<typeof form>) => setForm(prev => ({ ...prev, ...updates }));

  const jobTitle = form.title || `${t('work.' + form.workType.toLowerCase(), language)} - ${t('crop.' + form.cropType.toLowerCase(), language)}`;
  const farmerName = user?.name || 'Farmer';

  // Realtime listener
  useEffect(() => {
    if (!campaignId) return;
    const channel = supabase
      .channel(`ivr-job-${campaignId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ivr_calls', filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const updated = payload.new as any;
          setCalls(prev => prev.map(c => c.id === updated.id ? { ...c, status: updated.status, language_selected: updated.language_selected } : c));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [campaignId]);

  const simulateFakeWorkers = useCallback(async (totalNeeded: number, currentAccepted: number) => {
    const shuffled = [...FAKE_WORKER_NAMES].sort(() => Math.random() - 0.5);
    const shuffledPhones = [...FAKE_PHONES].sort(() => Math.random() - 0.5);
    let accepted = currentAccepted;
    let fakeIndex = 0;
    while (accepted < totalNeeded && fakeIndex < shuffled.length) {
      const name = shuffled[fakeIndex]; const phone = shuffledPhones[fakeIndex];
      const fakeId = `fake-${fakeIndex}-${Date.now()}`; fakeIndex++;
      setCalls(prev => [...prev, { id: fakeId, worker_name: name, worker_phone: phone, status: 'calling', language_selected: null, isReal: false }]);
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
      setCalls(prev => prev.map(c => c.id === fakeId ? { ...c, status: 'answered', language_selected: ['mr','hi','en'][Math.floor(Math.random()*3)] } : c));
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));
      const remaining = totalNeeded - accepted;
      const remainingWorkers = shuffled.length - fakeIndex;
      let outcome: string;
      if (remaining > remainingWorkers) outcome = 'accepted';
      else { const rand = Math.random(); outcome = rand < 0.6 ? 'accepted' : rand < 0.85 ? 'rejected' : 'unavailable'; }
      setCalls(prev => prev.map(c => c.id === fakeId ? { ...c, status: outcome } : c));
      if (outcome === 'accepted') accepted++;
      await new Promise(r => setTimeout(r, 500));
    }
    setIvrRunning(false); setIvrDone(true);
  }, []);

  useEffect(() => {
    if (!ivrRunning || !campaignId) return;
    const realCall = calls.find(c => c.isReal);
    if (!realCall) return;
    const finalStatuses = ['accepted','rejected','unavailable','no_response','failed'];
    if (finalStatuses.includes(realCall.status)) {
      const acceptedCount = realCall.status === 'accepted' ? 1 : 0;
      if (form.workersNeeded > 1) simulateFakeWorkers(form.workersNeeded, acceptedCount);
      else { setIvrRunning(false); setIvrDone(true); }
    }
  }, [calls, ivrRunning, campaignId, form.workersNeeded, simulateFakeWorkers]);

  const handlePublish = async () => {
    setStep(5); setIvrRunning(true); setCalls([]); setIvrDone(false);

    // Save job to database first
    if (user?.id) {
      const { error: jobError } = await supabase.from('jobs').insert({
        farmer_id: user.id,
        title: jobTitle,
        work_type: form.workType,
        crop_type: form.cropType,
        village: form.village,
        district: form.district,
        state: 'Maharashtra',
        work_date: form.date || null,
        start_time: form.startTime,
        duration: form.duration,
        workers_needed: form.workersNeeded,
        workers_accepted: 0,
        gender_pref: form.genderPref,
        experience_pref: form.experiencePref,
        urgency: form.urgency,
        wage_type: form.wageType,
        wage_amount: form.wageAmount,
        food_included: form.foodIncluded,
        transport_included: form.transportIncluded,
        tools_provided: form.toolsProvided,
        notes: form.notes,
        status: 'open',
      });
      if (jobError) {
        console.error('Failed to save job:', jobError);
        toast({ title: 'Error saving job', description: jobError.message, variant: 'destructive' });
      }
    }

    const realWorker = { name: 'Mandar Deshmukh', phone: '9699516587' };
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(`https://${projectId}.supabase.co/functions/v1/ivr-initiate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workers: [realWorker], farmerName, jobTitle,
          jobDate: form.date || t('review.notSet', language),
          jobHours: form.duration,
          jobLocation: `${form.village}, ${form.district}`,
          jobBudget: `₹${form.wageAmount}/${form.wageType === 'daily' ? t('common.day', language) : form.wageType === 'hourly' ? t('common.hourShort', language) : 'fixed'}`,
        }),
      });
      const data = await resp.json();
      if (data.error) { toast({ title: "IVR Error", description: data.error, variant: "destructive" }); setIvrRunning(false); return; }
      setCampaignId(data.campaignId);
      const { data: callRecords } = await supabase.from('ivr_calls').select('*').eq('campaign_id', data.campaignId);
      if (callRecords && callRecords.length > 0) {
        setCalls(callRecords.map(c => ({ id: c.id, worker_name: c.worker_name, worker_phone: c.worker_phone, status: c.status, language_selected: c.language_selected, isReal: true })));
      }
      toast({ title: t('jobPost.publishCall', language), description: `Calling Mandar Deshmukh first...` });
    } catch (err) { toast({ title: "Failed", description: String(err), variant: "destructive" }); setIvrRunning(false); }
  };

  const acceptedCount = calls.filter(c => c.status === 'accepted').length;

  const stepTitles = [
    t('jobPost.jobDetails', language),
    t('jobPost.workerReqs', language),
    t('jobPost.compensation', language),
    t('jobPost.review', language),
  ];

  // VoiceField is imported from shared component (stable, won't lose focus)

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('jobPost.title', language)} description={t('jobPost.description', language)} />

      {step <= 4 && (
        <div className="flex items-center gap-1">
          {stepTitles.map((title, i) => (
            <div key={i} className="flex flex-1 items-center gap-1">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step > i + 1 ? 'bg-success text-success-foreground' : step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden text-xs font-medium text-muted-foreground sm:inline">{title}</span>
              {i < 3 && <div className={`mx-1 h-0.5 flex-1 rounded ${step > i + 1 ? 'bg-success' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="h-4 w-4 text-primary" /> {t('jobPost.jobDetails', language)}
          </div>

          <VoiceField label={t('jobPost.jobTitle', language)} value={form.title} onChange={v => updateForm({ title: v })} placeholder={t('jobPost.jobTitlePlaceholder', language)} />
          <p className="-mt-3 text-xs text-muted-foreground">{t('jobPost.autoGenerate', language)}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('jobPost.workType', language)} *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {workTypeKeys.map(w => (
                  <button key={w} onClick={() => updateForm({ workType: w.charAt(0).toUpperCase() + w.slice(1) })} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${form.workType.toLowerCase() === w ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                    {t('work.' + w, language)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t('jobPost.cropType', language)} *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {cropTypeKeys.map(c => (
                  <button key={c} onClick={() => updateForm({ cropType: c.charAt(0).toUpperCase() + c.slice(1) })} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${form.cropType.toLowerCase() === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                    {t('crop.' + c, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <VoiceField label={`${t('jobPost.villageTown', language)}`} value={form.village} onChange={v => updateForm({ village: v })} placeholder={t('auth.villagePlaceholder', language)} />
            <VoiceField label={t('jobPost.district', language)} value={form.district} onChange={v => updateForm({ district: v })} placeholder="Pune" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {t('jobPost.workDate', language)} *</Label>
              <Input className="mt-1.5" type="date" value={form.date} onChange={e => updateForm({ date: e.target.value })} />
            </div>
            <div>
              <Label>{t('jobPost.startTime', language)}</Label>
              <Input className="mt-1.5" type="time" value={form.startTime} onChange={e => updateForm({ startTime: e.target.value })} />
            </div>
            <div>
              <Label>{t('jobPost.duration', language)}</Label>
              <div className="mt-1.5 flex gap-2">
                {durationKeys.map(d => (
                  <button key={d.key} onClick={() => updateForm({ duration: d.raw })} className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${form.duration === d.raw ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                    {t('dur.' + d.key, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!form.workType || !form.cropType} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {t('common.next', language)} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Users className="h-4 w-4 text-primary" /> {t('jobPost.workerReqs', language)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('jobPost.workersNeeded', language)} *</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <button onClick={() => updateForm({ workersNeeded: Math.max(1, form.workersNeeded - 1) })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg font-bold text-muted-foreground hover:bg-muted">−</button>
                <span className="w-12 text-center text-xl font-bold text-foreground">{form.workersNeeded}</span>
                <button onClick={() => updateForm({ workersNeeded: form.workersNeeded + 1 })} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg font-bold text-muted-foreground hover:bg-muted">+</button>
              </div>
            </div>
            <div>
              <Label>{t('jobPost.genderPref', language)}</Label>
              <div className="mt-1.5 flex gap-2">
                {[{ v: 'any', k: 'jobPost.any' }, { v: 'male', k: 'jobPost.male' }, { v: 'female', k: 'jobPost.female' }].map(g => (
                  <button key={g.v} onClick={() => updateForm({ genderPref: g.v })} className={`rounded-lg border px-4 py-2 text-xs font-medium ${form.genderPref === g.v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                    {t(g.k, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>{t('jobPost.expLevel', language)}</Label>
            <div className="mt-1.5 flex gap-2">
              {[{ v: 'any', k: 'jobPost.anyLevel' }, { v: 'beginner', k: 'exp.0-2' }, { v: 'experienced', k: 'exp.3-5' }, { v: 'expert', k: 'exp.5+' }].map(e => (
                <button key={e.v} onClick={() => updateForm({ experiencePref: e.v })} className={`rounded-lg border px-3 py-2 text-xs font-medium ${form.experiencePref === e.v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                  {t(e.k, language)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>{t('jobPost.urgency', language)}</Label>
            <div className="mt-1.5 flex gap-2">
              {[
                { v: 'normal', k: 'jobPost.normal', d: 'jobPost.withinWeek' },
                { v: 'urgent', k: 'jobPost.urgent', d: 'jobPost.oneTwo' },
                { v: 'critical', k: 'jobPost.critical', d: 'jobPost.todayTomorrow' },
              ].map(u => (
                <button key={u.v} onClick={() => updateForm({ urgency: u.v as any })} className={`flex-1 rounded-lg border p-3 text-left ${form.urgency === u.v ? u.v === 'critical' ? 'border-destructive bg-destructive/5' : u.v === 'urgent' ? 'border-accent bg-accent/5' : 'border-primary bg-primary/5' : 'border-border'}`}>
                  <p className={`text-xs font-bold ${form.urgency === u.v ? u.v === 'critical' ? 'text-destructive' : u.v === 'urgent' ? 'text-accent' : 'text-primary' : 'text-foreground'}`}>{t(u.k, language)}</p>
                  <p className="text-[10px] text-muted-foreground">{t(u.d, language)}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>{t('jobPost.notes', language)}</Label>
            <div className="mt-1.5 flex gap-2">
              <Textarea className="flex-1" rows={3} placeholder={t('jobPost.notesPlaceholder', language)} value={form.notes} onChange={e => updateForm({ notes: e.target.value })} />
              <VoiceInput onResult={(text) => updateForm({ notes: form.notes ? form.notes + ' ' + text : text })} />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="h-4 w-4" /> {t('common.back', language)}</Button>
            <Button onClick={() => setStep(3)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">{t('common.next', language)} <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Banknote className="h-4 w-4 text-primary" /> {t('jobPost.compensation', language)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t('jobPost.wageType', language)}</Label>
              <div className="mt-1.5 flex gap-2">
                {[{ v: 'daily', k: 'jobPost.perDay' }, { v: 'hourly', k: 'jobPost.perHour' }, { v: 'fixed', k: 'jobPost.fixedTotal' }].map(w => (
                  <button key={w.v} onClick={() => updateForm({ wageType: w.v as any })} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${form.wageType === w.v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                    {t(w.k, language)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t('jobPost.amount', language)} *</Label>
              <Input className="mt-1.5" type="number" value={form.wageAmount} onChange={e => updateForm({ wageAmount: Number(e.target.value) })} />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('jobPost.avgWage', language).replace('{work}', form.workType || 'farm work').replace('{district}', form.district)}
              </p>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t('jobPost.facilities', language)}</Label>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'foodIncluded', label: t('jobPost.food', language), value: form.foodIncluded },
                { key: 'transportIncluded', label: t('jobPost.transport', language), value: form.transportIncluded },
                { key: 'toolsProvided', label: t('jobPost.tools', language), value: form.toolsProvided },
              ].map(f => (
                <button key={f.key} onClick={() => updateForm({ [f.key]: !f.value } as any)} className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${f.value ? 'border-success bg-success/10 text-success' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">{t('jobPost.totalCost', language)}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              ₹{(form.wageAmount * form.workersNeeded * (form.duration.includes('week') ? 7 : parseInt(form.duration) || 1)).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{form.workersNeeded} {t('dash.workers', language)} × ₹{form.wageAmount}/{form.wageType === 'daily' ? t('common.day', language) : form.wageType === 'hourly' ? t('common.hourShort', language) : 'total'} × {form.duration}</p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="h-4 w-4" /> {t('common.back', language)}</Button>
            <Button onClick={() => setStep(4)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">{t('jobPost.review', language)} <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-base font-bold text-foreground">{t('jobPost.review', language)}</h3>
            <p className="text-xs text-muted-foreground">{t('jobPost.verifyDetails', language)}</p>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('review.jobTitle', language)}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{jobTitle}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('review.location', language)}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{form.village}, {form.district}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('review.dateAndDuration', language)}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{form.date || t('review.notSet', language)} • {form.duration} {t('review.starting', language)} {form.startTime}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('review.workersAndWage', language)}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{form.workersNeeded} {t('dash.workers', language)} • ₹{form.wageAmount}/{form.wageType === 'daily' ? t('common.day', language) : form.wageType === 'hourly' ? t('common.hourShort', language) : 'fixed'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.foodIncluded && <span className="rounded-full bg-success/10 text-success px-3 py-1 text-xs font-medium">{t('review.foodIncluded', language)}</span>}
                {form.transportIncluded && <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{t('review.transportIncluded', language)}</span>}
                {form.toolsProvided && <span className="rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-medium">{t('review.toolsProvided', language)}</span>}
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${form.urgency === 'critical' ? 'bg-destructive/10 text-destructive' : form.urgency === 'urgent' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {t('jobPost.' + form.urgency, language)} {t('review.priority', language)}
                </span>
              </div>

              {form.notes && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('jobPost.notes', language)}</p>
                  <p className="mt-0.5 text-sm text-foreground">{form.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-bold text-foreground mb-2">📞 {t('jobPost.workersCall', language)}</p>
            <p className="text-xs text-muted-foreground">
              {t('jobPost.firstCall', language)}: <strong className="text-foreground">Mandar Deshmukh (+91 9699516587)</strong> — {t('jobPost.realCall', language)}
            </p>
            {form.workersNeeded > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('jobPost.remaining', language).replace('{count}', String(form.workersNeeded - 1)).replace('{total}', String(form.workersNeeded))}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2"><ArrowLeft className="h-4 w-4" /> {t('review.edit', language)}</Button>
            <Button onClick={handlePublish} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
              <Phone className="h-4 w-4" /> {t('jobPost.publishCall', language)}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
            {ivrDone ? (
              <>
                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                <h3 className="text-lg font-bold text-foreground">{t('jobPost.hiringComplete', language)}</h3>
                <p className="text-sm text-muted-foreground">{t('jobPost.workersAccepted', language).replace('{accepted}', String(acceptedCount)).replace('{total}', String(form.workersNeeded))}</p>
              </>
            ) : (
              <>
                <PhoneCall className="h-10 w-10 text-accent mx-auto mb-2 animate-pulse" />
                <h3 className="text-lg font-bold text-foreground">{t('jobPost.callingWorkers', language)}</h3>
                <p className="text-sm text-muted-foreground">{t('jobPost.finding', language).replace('{count}', String(form.workersNeeded)).replace('{title}', jobTitle)}</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-bold text-foreground">{calls.length}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{t('jobPost.totalCalled', language)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-bold text-success">{acceptedCount}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{t('jobPost.accepted', language)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-bold text-foreground">{form.workersNeeded}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{t('jobPost.needed', language)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{t('jobPost.hiringProgress', language)}</span>
              <span>{t('jobPost.workersFound', language).replace('{accepted}', String(acceptedCount)).replace('{total}', String(form.workersNeeded))}</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              <div className="bg-success transition-all duration-500" style={{ width: `${(acceptedCount / form.workersNeeded) * 100}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">{t('jobPost.liveCallLog', language)}</h3>
            </div>
            <div className="divide-y divide-border">
              {calls.map(call => (
                <div key={call.id} className={`flex items-center gap-3 px-4 py-3 ${call.status === 'calling' || call.status === 'answered' ? 'bg-accent/5' : ''}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">{statusIcon(call.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {call.worker_name}
                      {call.isReal && <span className="ml-1.5 text-[10px] rounded-full bg-primary/10 text-primary px-1.5 py-0.5">REAL CALL</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {call.isReal ? `+91 ${call.worker_phone}` : call.worker_phone}
                      {call.language_selected && ` • ${call.language_selected === 'mr' ? 'मराठी' : call.language_selected === 'hi' ? 'हिंदी' : 'English'}`}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor(call.status)}`}>
                    {call.status === 'calling' && '📞 '}{call.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
              {calls.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <Phone className="h-6 w-6 mx-auto mb-2 animate-pulse text-accent" />
                  {t('jobPost.initiating', language)}
                </div>
              )}
            </div>
          </div>

          {ivrDone && (
            <div className="flex justify-center">
              <Button onClick={() => navigate('/farmer/jobs')} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                <CheckCircle2 className="h-4 w-4" /> {t('jobPost.viewJobs', language)}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
