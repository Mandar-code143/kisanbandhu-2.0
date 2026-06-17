import { weatherData } from '@/lib/demo-data';
import { PageHeader } from '@/components/shared/SharedComponents';
import { Sun, Droplets, Wind, Sunrise, Sunset, CloudRain, AlertTriangle, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';

const conditionIcon = (c: string) => {
  if (c.includes('Rain')) return <CloudRain className="h-5 w-5 text-primary" />;
  if (c.includes('Cloud')) return <Sun className="h-5 w-5 text-muted-foreground" />;
  return <Sun className="h-5 w-5 text-accent" />;
};

export default function Weather() {
  const { language } = useAuth();
  const d = weatherData;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <PageHeader title={t('weather.title', language)} description={d.location} />

      <div className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/70">{t('weather.current', language)}</p>
            <p className="mt-1 text-5xl font-bold">{d.current.temp}°C</p>
            <p className="mt-1 text-sm text-primary-foreground/80">{d.current.condition} • {t('weather.feelsLike', language)} {d.current.feelsLike}°C</p>
          </div>
          <Sun className="h-16 w-16 text-primary-foreground/30" />
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { icon: Droplets, value: `${d.current.humidity}%`, label: t('weather.humidity', language) },
            { icon: Wind, value: `${d.current.wind} km/h`, label: t('weather.wind', language) },
            { icon: Sunrise, value: d.sunrise, label: t('weather.sunrise', language) },
            { icon: Sunset, value: d.sunset, label: t('weather.sunset', language) },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-primary-foreground/10 p-3 text-center backdrop-blur-sm">
              <item.icon className="mx-auto h-4 w-4 text-primary-foreground/60" />
              <p className="mt-1 text-sm font-bold">{item.value}</p>
              <p className="text-[10px] text-primary-foreground/60">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-success/5 p-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
            <Leaf className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{t('weather.advisory', language)}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.advisory}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-bold text-foreground">{t('weather.hourly', language)}</h3>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {d.hourly.map((h, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-1.5 rounded-lg bg-muted/50 px-4 py-3 text-center">
              <p className="text-xs font-medium text-muted-foreground">{h.time}</p>
              {conditionIcon(h.condition)}
              <p className="text-sm font-bold text-foreground">{h.temp}°</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-bold text-foreground">{t('weather.weekly', language)}</h3>
        <div className="mt-3 space-y-2">
          {d.weekly.map((day, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg p-2.5 hover:bg-muted/50">
              <span className="w-10 text-sm font-medium text-foreground">{day.day}</span>
              <div className="flex items-center gap-2">
                {conditionIcon(day.condition)}
                <span className="w-24 text-xs text-muted-foreground">{day.condition}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {day.rain > 0 && <span className="flex items-center gap-0.5 text-primary"><Droplets className="h-3 w-3" />{day.rain}%</span>}
                <span className="font-medium text-foreground">{day.high}°</span>
                <span className="text-muted-foreground">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 shadow-card">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
          <div>
            <h3 className="text-sm font-bold text-foreground">{t('dash.heavyRain', language)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('dash.secureCrops', language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
