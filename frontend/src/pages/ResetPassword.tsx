import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setValidSession(true);
    }
    if (new URLSearchParams(window.location.search).has('recovery')) {
      setValidSession(true);
    }
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords don\'t match', description: 'Please make sure both passwords are the same', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const email = localStorage.getItem('reset_email');
    try {
      const { auth } = await import('@/lib/api');
      if (email) {
        await auth.resetPassword(email, '000000', password);
      }
      setSuccess(true);
      toast({ title: 'Password updated!', description: 'You can now log in with your new password' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to reset password', variant: 'destructive' });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Password Updated!</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your password has been reset successfully.</p>
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground">Invalid Reset Link</h2>
          <p className="mt-2 text-sm text-muted-foreground">This password reset link is invalid or has expired. Please request a new one.</p>
          <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
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

        <h2 className="text-2xl font-bold text-foreground">Set New Password</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Enter your new password below.</p>

        <div className="mt-8 space-y-4">
          <div>
            <Label>New Password</Label>
            <div className="relative mt-1.5">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input className="mt-1.5" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()} />
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading} onClick={handleReset}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </div>
    </div>
  );
}
