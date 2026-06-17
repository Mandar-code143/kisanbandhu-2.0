import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { PageHeader, StatusBadge } from '@/components/shared/SharedComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import VoiceField from '@/components/shared/VoiceField';
import VoiceInput from '@/components/shared/VoiceInput';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Star, Phone, Mail, Edit, ShieldCheck, Calendar, Save, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, language, refreshProfile, supabaseUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', village: '', district: '', state: '',
    primary_crops: '', skills: '', daily_wage: 0, experience_years: 0,
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.name || '',
        phone: user.phone || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        primary_crops: user.primaryCrops || '',
        skills: user.skills || '',
        daily_wage: user.dailyWage || 0,
        experience_years: user.experienceYears || 0,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!supabaseUser) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      village: form.village,
      district: form.district,
      state: form.state,
      primary_crops: form.primary_crops || null,
      skills: form.skills || null,
      daily_wage: form.daily_wage || null,
      experience_years: form.experience_years || null,
    }).eq('id', supabaseUser.id);
    setSaving(false);

    if (error) {
      toast({ title: t('auth.signupFailed', language), description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      setEditing(false);
      toast({ title: t('profile.saved', language), description: t('profile.savedDesc', language) });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabaseUser) return;
    const ext = file.name.split('.').pop();
    const path = `${supabaseUser.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', supabaseUser.id);
    await refreshProfile();
    toast({ title: t('profile.photoUpdated', language) });
  };

  if (!user) return null;

  const update = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('profile.title', language)}>
        {!editing ? (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setEditing(true)}>
            <Edit className="h-3.5 w-3.5" /> {t('profile.editBtn', language)}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setEditing(false)}>
              <X className="h-3.5 w-3.5" /> {t('common.cancel', language)}
            </Button>
            <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
              <Save className="h-3.5 w-3.5" /> {saving ? t('common.loading', language) : t('common.save', language)}
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="relative group">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                {user.name.charAt(0)}
              </div>
            )}
            {editing && (
              <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-foreground/40 text-primary-foreground opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="h-5 w-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <VoiceField label={t('auth.fullName', language)} value={form.full_name} onChange={v => update('full_name', v)} placeholder={t('auth.namePlaceholder', language)} />
                <VoiceField label={t('auth.phone', language)} value={form.phone} onChange={v => update('phone', v)} placeholder="9876543210" type="tel" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  {user.verified && <StatusBadge status="verified" />}
                </div>
                <p className="mt-0.5 text-sm capitalize text-muted-foreground">{user.role === 'farmer' ? t('auth.farmer', language) : t('auth.worker', language)}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {user.village && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.village}, {user.district}, {user.state}</span>}
                  {user.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {user.phone}</span>}
                  {user.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
          <Star className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-2 text-2xl font-bold text-foreground">{user.rating}</p>
          <p className="text-xs text-muted-foreground">{user.reviewCount} {t('profile.reviews', language)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
          <Calendar className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-sm font-bold text-foreground">{t('profile.joined', language)} {new Date(user.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
          <p className="text-xs text-muted-foreground">{t('profile.memberSince', language)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-success" />
          <p className="mt-2 text-sm font-bold text-foreground">{user.verified ? t('profile.verified', language) : t('profile.pending', language)}</p>
          <p className="text-xs text-muted-foreground">{t('profile.identityStatus', language)}</p>
        </div>
      </div>

      {/* Farmer details */}
      {user.role === 'farmer' && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold text-foreground">{t('profile.farmDetails', language)}</h3>
          {editing ? (
            <div className="mt-3 space-y-3">
              <VoiceField label={t('auth.village', language)} value={form.village} onChange={v => update('village', v)} placeholder={t('auth.villagePlaceholder', language)} />
              <div className="grid grid-cols-2 gap-3">
                <VoiceField label={t('auth.district', language)} value={form.district} onChange={v => update('district', v)} placeholder="Pune" />
                <VoiceField label={t('auth.state', language)} value={form.state} onChange={v => update('state', v)} placeholder="Maharashtra" />
              </div>
              <VoiceField label={t('auth.primaryCrops', language)} value={form.primary_crops} onChange={v => update('primary_crops', v)} placeholder={t('auth.cropsPlaceholder', language)} />
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { label: t('profile.farmType', language), value: t('profile.mixedCropping', language) },
                { label: t('profile.primaryCrops', language), value: user.primaryCrops || '-' },
                { label: t('auth.village', language), value: user.village || '-' },
                { label: t('auth.district', language), value: `${user.district}, ${user.state}` },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Worker details */}
      {user.role === 'worker' && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold text-foreground">{t('profile.workProfile', language)}</h3>
          {editing ? (
            <div className="mt-3 space-y-3">
              <VoiceField label={t('auth.village', language)} value={form.village} onChange={v => update('village', v)} placeholder={t('auth.villagePlaceholder', language)} />
              <div className="grid grid-cols-2 gap-3">
                <VoiceField label={t('auth.district', language)} value={form.district} onChange={v => update('district', v)} placeholder="Pune" />
                <VoiceField label={t('auth.state', language)} value={form.state} onChange={v => update('state', v)} placeholder="Maharashtra" />
              </div>
              <VoiceField label={t('auth.keySkills', language)} value={form.skills} onChange={v => update('skills', v)} placeholder={t('auth.skillsPlaceholder', language)} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('profile.experience', language)}</Label>
                  <Input className="mt-1.5" type="number" value={form.experience_years} onChange={e => update('experience_years', Number(e.target.value))} />
                </div>
                <div>
                  <Label>{t('profile.dailyWage', language)} (₹)</Label>
                  <Input className="mt-1.5" type="number" value={form.daily_wage} onChange={e => update('daily_wage', Number(e.target.value))} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t('profile.skills', language)}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(user.skills ? user.skills.split(',') : ['-']).map(s => (
                    <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{s.trim()}</span>
                  ))}
                </div>
              </div>
              {[
                { label: t('profile.experience', language), value: user.experienceYears ? `${user.experienceYears} ${t('profile.years', language)}` : '-' },
                { label: t('profile.dailyWage', language), value: user.dailyWage ? `₹${user.dailyWage}/${t('common.day', language)}` : '-' },
                { label: t('profile.languages', language), value: 'Marathi, Hindi' },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
