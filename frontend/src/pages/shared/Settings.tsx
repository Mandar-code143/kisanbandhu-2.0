import { useState } from 'react';
import { PageHeader } from '@/components/shared/SharedComponents';
import { Globe, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { languages, t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${enabled ? 'translate-x-5.5 left-auto right-0.5' : 'left-0.5'}`}
        style={{ transform: enabled ? 'translateX(0)' : 'translateX(0)', left: enabled ? 'auto' : '2px', right: enabled ? '2px' : 'auto' }} />
    </button>
  );
}

export default function Settings() {
  const { language, setLanguage } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    weatherAlerts: true,
    schemeUpdates: true,
    bookingReminders: true,
  });

  const notifLabel: Record<keyof typeof notifications, string> = {
    jobAlerts: t('settings.jobAlerts', language),
    weatherAlerts: t('settings.weatherAlerts', language),
    schemeUpdates: t('settings.schemeUpdates', language),
    bookingReminders: t('settings.bookingReminders', language),
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const newVal = !prev[key];
      toast({
        title: newVal ? t('settings.enabled', language) : t('settings.disabled', language),
        description: `${notifLabel[key]} ${newVal ? t('settings.turnedOn', language) : t('settings.turnedOff', language)}`,
      });
      return { ...prev, [key]: newVal };
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('nav.settings', language)} description={t('settings.managePreferences', language)} />

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">{t('settings.language', language)}</h3>
          </div>
          <div className="flex gap-2">
            {languages.map(l => (
              <Button key={l.code} size="sm" variant={language === l.code ? 'default' : 'outline'}
                onClick={() => { setLanguage(l.code); toast({ title: t('settings.languageChanged', language), description: `${t('settings.switchedTo', language)} ${l.native}.` }); }}
                className={`text-xs ${language === l.code ? 'bg-primary text-primary-foreground' : ''}`}>
                {l.native}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-accent" />
            <h3 className="text-sm font-bold text-foreground">{t('settings.notifications', language)}</h3>
          </div>
          <div className="space-y-3">
            {((Object.keys(notifications) as (keyof typeof notifications)[]).map(key => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-foreground">{notifLabel[key]}</span>
                <Toggle enabled={notifications[key]} onToggle={() => toggleNotif(key)} />
              </div>
            )))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-success" />
            <h3 className="text-sm font-bold text-foreground">{t('settings.accountSecurity', language)}</h3>
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => toast({ title: t('settings.changePassword', language), description: t('settings.comingSoon', language) })}>
              {t('settings.changePassword', language)}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => toast({ title: t('settings.manageDocuments', language), description: t('settings.comingSoon', language) })}>
              {t('settings.manageDocuments', language)}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs text-destructive hover:text-destructive" onClick={() => toast({ title: t('settings.deleteAccount', language), description: t('settings.deleteSupport', language), variant: "destructive" })}>
              {t('settings.deleteAccount', language)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
