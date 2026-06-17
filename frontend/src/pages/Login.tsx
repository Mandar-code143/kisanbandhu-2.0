import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ParticleField } from '@/components/animations/ParticleField';

export default function Login() {
  const { login, demoLogin, language } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const itemLabel = (role: UserRole, lang: typeof language) => role === 'farmer' ? t('auth.farmer', lang) : role === 'worker' ? t('auth.worker', lang) : t('auth.admin', lang);

  const handleLogin = async () => {
    if (!phone || !password) {
      toast({ title: t('auth.missingFields', language), description: t('auth.enterEmailPassword', language), variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await login(phone, password);
    if (result.error) {
      setLoading(false);
      toast({ title: t('auth.loginFailed', language), description: result.error, variant: "destructive" });
    } else {
      toast({ title: t('auth.welcomeBack', language), description: t('auth.loggedInSuccess', language) });
      setTimeout(() => {
        const cached = localStorage.getItem('krushi_user');
        if (cached) {
          const u = JSON.parse(cached);
          const role = u.role || 'farmer';
          navigate(role === 'admin' ? '/admin' : role === 'worker' ? '/worker' : '/farmer');
        } else {
          navigate('/farmer');
        }
      }, 500);
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    setLoading(true);
    setTimeout(() => {
      demoLogin(role);
      toast({ title: t('auth.welcomeBack', language), description: `${t('auth.loggedInAsDemo', language)} ${itemLabel(role, language)}.` });
      navigate(role === 'admin' ? '/admin' : role === 'worker' ? '/worker' : '/farmer');
    }, 300);
  };

  const handleAdminAccess = () => {
  if (adminPassword === "KRUSHI_ADMIN_2026") {
    setShowAdminPopup(false);
    demoLogin("admin");

    toast({
      title: "Admin Access Granted",
      description: "Welcome Admin",
    });

    navigate("/admin");
  } else {
    toast({
      title: "Access Denied",
      description: "Incorrect Admin Password",
      variant: "destructive",
    });
  }
};

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-hero p-12 lg:flex relative overflow-hidden">
        <ParticleField count={25} className="opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-md text-primary-foreground relative z-10"
        >
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Leaf className="h-8 w-8" />
          </motion.div>
          <h1 className="mt-8 text-4xl font-bold leading-tight">{t('login.heroTitle', language)}</h1>
          <p className="mt-4 text-lg text-primary-foreground/75">{t('login.heroSubtitle', language)}</p>
          <div className="mt-10 space-y-3 text-sm text-primary-foreground/60">
            {[t('login.bullet1', language), t('login.bullet2', language), t('login.bullet3', language)].map((item, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
              >
                {item}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">Krushi Rojgar Sandhi</span>
            </Link>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-foreground"
          >
            {t('auth.login', language)}
          </motion.h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.loginSubtitle', language)}</p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-4"
          >
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">{t('auth.phone', language)}</Label>
              <Input id="phone" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">{t('auth.password', language)}</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t('auth.forgotPassword', language)}</Link>
              </div>
              <div className="relative mt-1.5">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 relative overflow-hidden group" disabled={loading} onClick={handleLogin}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? t('common.loading', language) : t('auth.login', language)} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t('auth.demoAccess', language)}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { role: 'farmer' as UserRole, emoji: '👨‍🌾', label: t('auth.farmer', language) },
              { role: 'worker' as UserRole, emoji: '👷', label: t('auth.worker', language) },
              { role: 'admin' as UserRole, emoji: '🔧', label: t('auth.admin', language) },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                if (item.role === 'admin') {
                  setShowAdminPopup(true);
                } else {
                  handleDemoLogin(item.role);
                }
              }}
              disabled={loading}
              className="text-xs w-full"
            >
              {item.emoji} {item.label}
          </Button>
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.noAccount', language)}{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">{t('auth.signup', language)}</Link>
          </p>

          {showAdminPopup && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
      <h2 className="text-xl font-bold mb-4">
        Admin Access
      </h2>

      <Input
        type="password"
        placeholder="Enter Admin Password"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
      />

      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => {
            setShowAdminPopup(false);
            setAdminPassword('');
          }}
        >
          Cancel
        </Button>

        <Button onClick={handleAdminAccess}>
          Login
        </Button>
      </div>
    </div>
  </div>
)}
        </motion.div>
      </div>
    </div>
  );
}
