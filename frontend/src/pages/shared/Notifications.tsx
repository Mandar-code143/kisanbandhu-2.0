import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/shared/SharedComponents';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Bell, Briefcase, Cloud, Calendar, FileText, ShieldCheck, CheckCheck, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

const typeIcon = (type: string) => {
  switch (type) {
    case 'job': return <Briefcase className="h-4 w-4 text-primary" />;
    case 'weather': return <Cloud className="h-4 w-4 text-accent" />;
    case 'booking': return <Calendar className="h-4 w-4 text-success" />;
    case 'scheme': return <FileText className="h-4 w-4 text-olive" />;
    case 'verification': return <ShieldCheck className="h-4 w-4 text-success" />;
    default: return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function Notifications() {
  const { user, language } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({ title: t('notifications.allRead', language), description: t('notifications.markedRead', language) });
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <SEOHead title="Notifications" description="Stay updated with job alerts, weather warnings, and booking updates." />
      <PageHeader title={t('nav.notifications', language)} description={`${unreadCount} ${t('notifications.unread', language)}`}>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()} className="gap-1.5 text-xs">
            <CheckCheck className="h-3.5 w-3.5" /> {t('notifications.markAllRead', language)}
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No notifications yet. They'll appear here when you get job updates, weather alerts, etc.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id}
              onClick={() => { 
                if (!n.read) markReadMutation.mutate(n.id);
                if (n.action_url) navigate(n.action_url); 
              }}
              className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${n.read ? 'border-border bg-card' : 'border-primary/20 bg-primary/5'} shadow-card hover:shadow-elevated`}>
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${n.read ? 'text-foreground' : 'text-primary'}`}>{n.title}</h3>
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString(language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'mr-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
