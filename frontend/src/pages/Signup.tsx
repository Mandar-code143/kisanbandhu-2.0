import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, ArrowRight, ArrowLeft, CheckCircle2, Tractor as TractorIcon, Briefcase, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceInput from '@/components/shared/VoiceInput';

export default function Signup() {
  const { signup, demoLogin, language } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
    village: '', district: 'Pune', state: 'Maharashtra', primaryCrops: '', skills: '', dailyWage: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.password) {
      toast({ title: t('auth.missingFields', language), description: t('auth.fillRequired', language), variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: t('auth.passwordMismatch', language), description: t('auth.passwordsDontMatch', language), variant: "destructive" });
      return;
    }
    if (!role) return;

    setLoading(true);
    const result = await signup(form.phone, form.password, {
      fullName: form.name,
      email: form.email,
      role,
      village: form.village,
      district: form.district,
      state: form.state,
      languagePref: language,
      primaryCrops: form.primaryCrops,
      skills: form.skills,
      dailyWage: form.dailyWage,
    });
    setLoading(false);

    if (result.error) {
      toast({ title: t('auth.signupFailed', language), description: result.error, variant: "destructive" });
    } else {
      setEmailSent(true);
    }
  };

  const voiceAppend = (field: string) => (text: string) => {
    setForm(prev => ({ ...prev, [field]: prev[field as keyof typeof prev] ? prev[field as keyof typeof prev] + ' ' + text : text }));
  };

  const renderField = (field: string, placeholder: string, label: string, type = 'text') => (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          className="flex-1"
          type={type}
          placeholder={placeholder}
          value={(form as any)[field]}
          onChange={e => update(field, e.target.value)}
        />
        <VoiceInput onResult={voiceAppend(field)} />
      </div>
    </div>
  );

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Verify Your Email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a verification link to <strong className="text-foreground">{form.email}</strong>. Please click the link in the email to activate your account.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Didn't receive it? Check your spam folder.</p>
          <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">Krushi Rojgar Sandhi</span>
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step > s ? 'bg-success text-success-foreground' : step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 rounded ${step > s ? 'bg-success' : 'bg-muted'}`} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">{t('auth.stepOf', language).replace('{step}', String(step)).replace('{total}', '3')}</span>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t('auth.chooseRole', language)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.selectUsage', language)}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => { setRole('farmer'); setStep(2); }}
                className={`rounded-xl border-2 p-6 text-left transition-all ${role === 'farmer' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TractorIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{t('auth.farmer', language)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('auth.farmerDesc', language)}</p>
              </button>

              <button
                onClick={() => { setRole('worker'); setStep(2); }}
                className={`rounded-xl border-2 p-6 text-left transition-all ${role === 'worker' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{t('auth.worker', language)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('auth.workerDesc', language)}</p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t('auth.yourDetails', language)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.basicInfo', language)}</p>

            <div className="mt-6 space-y-4">
              {renderField('name', t('auth.namePlaceholder', language), `${t('auth.fullName', language)} *`)}
              {renderField('phone', '9876543210', `${t('auth.phone', language)} *`, 'tel')}
              <div>
                <Label>{t('auth.email', language)} *</Label>
                <Input className="mt-1.5" type="email" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('auth.password', language)} *</Label>
                  <Input className="mt-1.5" type="password" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
                <div>
                  <Label>{t('auth.confirmPassword', language)} *</Label>
                  <Input className="mt-1.5" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="h-4 w-4" /> {t('common.back', language)}</Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => {
                if (!form.name || !form.phone || !form.email || !form.password) {
                  toast({ title: t('auth.missingFields', language), description: t('auth.fillRequired', language), variant: "destructive" });
                  return;
                }
                setStep(3);
              }}>{t('common.next', language)} <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t('auth.locationPrefs', language)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.locationDesc', language)}</p>

            <div className="mt-6 space-y-4">
              {renderField('village', t('auth.villagePlaceholder', language), t('auth.village', language))}
              <div className="grid grid-cols-2 gap-3">
                {renderField('district', 'Pune', t('auth.district', language))}
                {renderField('state', 'Maharashtra', t('auth.state', language))}
              </div>

              {role === 'farmer' && (
                renderField('primaryCrops', t('auth.cropsPlaceholder', language), t('auth.primaryCrops', language))
              )}

              {role === 'worker' && (
                <>
                  {renderField('skills', t('auth.skillsPlaceholder', language), t('auth.keySkills', language))}
                  {renderField('dailyWage', '400', t('auth.expectedWage', language), 'number')}
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="h-4 w-4" /> {t('common.back', language)}</Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={handleSubmit} disabled={loading}>
                {loading ? t('common.loading', language) : t('auth.createAccount', language)} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('auth.haveAccount', language)}{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">{t('auth.login', language)}</Link>
        </p>
      </div>
    </div>
  );
}
