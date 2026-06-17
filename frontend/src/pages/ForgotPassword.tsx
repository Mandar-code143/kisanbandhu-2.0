import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth as apiAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { Leaf, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast({ title: 'Enter your email', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await apiAuth.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send reset link', variant: 'destructive' });
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Check Your Email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link in the email to set a new password.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Didn't receive it? Check your spam folder or try again.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Button variant="outline" onClick={() => setSent(false)}>Try another email</Button>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">Krushi Rojgar Sandhi</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-foreground">{t('auth.forgotPassword', language)}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter the email address you used to sign up and we'll send you a link to reset your password.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <Label>{t('auth.email', language)}</Label>
            <Input className="mt-1.5" type="email" placeholder={t('auth.emailPlaceholder', language)} value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading} onClick={handleSubmit}>
            {loading ? t('common.loading', language) : 'Send Reset Link'}
          </Button>
        </div>

        <Link to="/login" className="mt-6 flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t('auth.login', language)}
        </Link>
      </div>
    </div>
  );
}
