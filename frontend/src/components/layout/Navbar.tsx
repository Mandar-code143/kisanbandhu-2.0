import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { t, languages } from '@/lib/i18n';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, Globe, Bell, LogOut,
  Leaf, Briefcase, Tractor, Cloud, FileText, LayoutDashboard, Settings, HelpCircle, User, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, isAuthenticated, logout, language, setLanguage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'worker' ? '/worker' : '/farmer';

  const navLinks = isAuthenticated ? [
    { to: dashboardPath, label: t('nav.dashboard', language), icon: LayoutDashboard },
    { to: `${dashboardPath}/jobs`, label: t('nav.jobs', language), icon: Briefcase },
    ...(user?.role === 'farmer' ? [{ to: '/farmer/ivr', label: t('nav.ivrCalls', language), icon: Phone }] : []),
    { to: `${dashboardPath}/schemes`, label: t('nav.schemes', language), icon: FileText },
    { to: `${dashboardPath}/weather`, label: t('nav.weather', language), icon: Cloud },
  ] : [
    { to: '/', label: t('nav.home', language) },
    { to: '/#features', label: t('nav.features', language) },
    { to: '/#how-it-works', label: t('nav.howItWorks', language) },
    { to: '/about', label: t('nav.about', language) },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-xl ${isLanding && !isAuthenticated ? 'bg-background/80' : 'bg-card/90'}`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to={isAuthenticated ? dashboardPath : '/'} className="flex items-center gap-2.5 group">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">Krushi Rojgar</span>
            <span className="text-[10px] font-medium leading-tight text-muted-foreground">SANDHI</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} className="relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 rounded-lg bg-muted"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-foreground' : ''}`}>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="hidden text-xs sm:inline">{languages.find(l => l.code === language)?.native}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map(l => (
                <DropdownMenuItem key={l.code} onClick={() => setLanguage(l.code)} className={language === l.code ? 'bg-muted' : ''}>
                  {l.native} <span className="ml-2 text-xs text-muted-foreground">({l.label})</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground" onClick={() => navigate(`${dashboardPath}/notifications`)}>
                  <Bell className="h-4.5 w-4.5" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground"
                  >
                    2
                  </motion.span>
                </Button>
              </motion.div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <motion.div
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                      whileHover={{ scale: 1.1 }}
                    >
                      {user?.name?.charAt(0)}
                    </motion.div>
                    <span className="hidden text-sm sm:inline">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role} • {user?.district}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`${dashboardPath}/profile`)}>
                    <User className="mr-2 h-4 w-4" /> {t('nav.profile', language)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`${dashboardPath}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" /> {t('nav.settings', language)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`${dashboardPath}/help`)}>
                    <HelpCircle className="mr-2 h-4 w-4" /> {t('nav.help', language)}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
                    <LogOut className="mr-2 h-4 w-4" /> {t('nav.logout', language)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
                {t('nav.login', language)}
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" onClick={() => navigate('/signup')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t('nav.signup', language)}
                </Button>
              </motion.div>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border md:hidden overflow-hidden"
          >
            <nav className="container flex flex-col gap-1 py-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={link.to} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground block">
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {!isAuthenticated && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.05 }}>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground block">
                    {t('nav.login', language)}
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
