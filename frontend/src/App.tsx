/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  MapPin, 
  Globe, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  Bell, 
  CheckCircle, 
  Sparkles, 
  Lock, 
  Smartphone, 
  CircleDot,
  Heart,
  Mail,
  ShieldCheck,
  ChevronDown,
  Trash2,
  Trash
} from 'lucide-react';

import { AppView, Language, User, ActivityLog } from './types';
import { translations } from './lib/translations';

// Subcomponents
import GlowEffect from './components/GlowEffect';
import LandingPage from './components/LandingPage';
import Marketplace from './components/Marketplace';
import Dashboard from './components/Dashboard';
import IVRBroadcast from './components/IVRBroadcast';

export default function App() {
  // 1. Language States
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('krushi_lang');
    return (saved as Language) || 'mr'; // Marathi by default to honor rural Maharashtra agricultural heritage!
  });

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const handleLanguageChange = (l: Language) => {
    setLang(l);
    localStorage.setItem('krushi_lang', l);
  };

  // 2. Client Active View state
  const [activeView, setActiveView] = useState<AppView>('home');

  // 3. User Authentication state (Default logged in to give impressive zero-setup premium visual demo!)
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('krushi_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return {
      id: "usr-401",
      name: "Rajesh Patil",
      phone: "98201 22301",
      role: "farmer",
      email: "rajesh.patil.niphad@gmail.com",
      locationState: "Maharashtra",
      locationDistrict: "Nashik",
      isPremium: true // Default premium enabled for impressive demo controls
    };
  });

  // Apply track state
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('applied_jobs');
    return saved ? JSON.parse(saved) : ["job-003"];
  });

  // Timeline chronology actions Log
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "act-1",
      type: "job_posted",
      title: "Grafting specialists application parsed",
      description: "Auto system parsed 14 matching worker profiles for grape vineyards.",
      timestamp: "10 mins ago"
    },
    {
      id: "act-2",
      type: "ivr_launched",
      title: "Emergency Grape Grafting broadcast completed",
      description: "Automated IVR call sent successfully to 4,200 local workers.",
      timestamp: "2 hours ago"
    }
  ]);

  // Handle adding new actions
  const addActivityLog = (
    type: 'job_posted' | 'application_received' | 'job_accepted' | 'payment_processed' | 'ivr_launched',
    title: string,
    desc: string
  ) => {
    const newAct: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      title,
      description: desc,
      timestamp: "Just Now"
    };
    setActivityLogs(prev => [newAct, ...prev]);
  };

  // Persists
  useEffect(() => {
    if (user) {
      localStorage.setItem('krushi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('krushi_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('applied_jobs', JSON.stringify(appliedJobIds));
  }, [appliedJobIds]);

  // Job applying logic
  const handleApplyJob = (jobId: string) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds(prev => [...prev, jobId]);
    }
  };

  // Nav scroll tracking
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4. Modal and Signup forms variables
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState('');
  
  useEffect(() => {
    setAuthError('');
  }, [authMode, isAuthModalOpen]);
  
  // Signup State Form Fields
  const [regRole, setRegRole] = useState<'farmer' | 'worker' | 'contractor'>('farmer');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDistrict, setRegDistrict] = useState('Nashik');

  // Login variables
  const [logPhone, setLogPhone] = useState('');
  const [logPassword, setLogPassword] = useState('');

  // Notification badge alerts toggle
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { text: "Smart matching processed 2 new cotton plucker candidate profiles.", time: "1 hr ago" },
    { text: "Your IVR Voice Broadcast campaign scheduled for June 2nd is ready.", time: "3 hrs ago" },
    { text: "Direct escrow wage deposit for Maruti Deshmukh released successfully.", time: "Yesterday" }
  ]);

  // Upgrade Pro Modal trigger
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Authenticate triggers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'signup') {
      if (!regName || !regPhone || !regPassword) {
        setAuthError("Please fill all required fields.");
        return;
      }
      try {
        const [firstName, ...lastNameParts] = regName.trim().split(' ');
        const lastName = lastNameParts.join(' ') || "";
        const res = await fetch("https://kisanbandhu.onrender.com/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: regPhone,
            password: regPassword,
            firstName: firstName || regName,
            lastName: lastName,
            role: regRole.toUpperCase(),
            district: regDistrict,
            languagePref: lang
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");
        
        const newUser: User = {
          id: data.data.user.id,
          name: regName,
          phone: regPhone,
          role: regRole,
          locationState: "Maharashtra",
          locationDistrict: regDistrict,
          isPremium: false
        };
        setUser(newUser);
        localStorage.setItem("krushi_token", data.data.accessToken);
        addActivityLog('job_accepted', 'New Account Created', `Welcome to Krushi Rojgar Sandhi as a verified ${regRole}.`);
      } catch (err: any) {
        setAuthError(err.message);
        return;
      }
    } else {
      // login
      if (!logPhone || !logPassword) {
        setAuthError("Please enter phone address and password.");
        return;
      }
      try {
        const res = await fetch("https://kisanbandhu.onrender.com/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: logPhone,
            password: logPassword
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        const u = data.data.user;
        const profile = u.profile || {};
        const existingUser: User = {
          id: u.id,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || u.phone,
          phone: u.phone,
          role: u.role.toLowerCase(),
          locationState: "Maharashtra",
          locationDistrict: profile.district || "Nashik",
          isPremium: false
        };
        setUser(existingUser);
        localStorage.setItem("krushi_token", data.data.accessToken);
        addActivityLog('job_accepted', 'Secure Login Completed', `Successfully authenticated profile ${existingUser.name}.`);
      } catch (err: any) {
        setAuthError(err.message);
        return;
      }
    }
    setIsAuthModalOpen(false);
    setActiveView('dashboard');
  };

  // Quick Sign out
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('krushi_user');
    setActiveView('home');
  };

  // Switch roles inside dashboard securely
  const handleChangeRole = (role: 'farmer' | 'worker' | 'contractor') => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
    }
  };

  // Upgrade user pro
  const handleUpgradeToPro = () => {
    if (user) {
      const updated = { ...user, isPremium: true };
      setUser(updated);
      setIsUpgradeOpen(false);
      alert(t('premiumUpgradeSuccess'));
      addActivityLog('payment_processed', 'Upgraded to Premium Pro', 'Unlocked unlimited matching checklists and IVR automation.');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleProtectedAction = (targetView: AppView) => {
    if (!user) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    } else {
      setActiveView(targetView);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary selection:bg-primary-500 selection:text-white" id="main-application-shell">
      
      {/* 1. Global Custom Ambient cursor glowing particles effect */}
      <GlowEffect />

      {/* Top scroll thin fill progress highlight */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-300 z-[60]" />

      {/* 2. NAVIGATION HEADER BAR */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'h-16 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle shadow-lg' 
            : 'h-20 bg-transparent border-b border-transparent'
        }`}
        id="navbar-station"
      >
        <div className="container mx-auto px-4 max-w-7xl h-full flex justify-between items-center">
          
          {/* Logo brand section */}
          <button 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
            id="brand-lead-logo"
          >
            <img src="/logo.png" alt="KisanBandhu Logo" className="h-10 object-contain" />
            <div>
              <div className="text-white font-extrabold text-sm md:text-base font-heading group-hover:text-primary-400 transition-colors tracking-tight leading-tight">
                {t('appName')}
              </div>
              <span className="text-[9px] text-[#a3c4b0] tracking-widest font-semibold uppercase leading-none block">
                ROJGAR SANDHI
              </span>
            </div>
          </button>

          {/* Center Links (Desktop only) */}
          <div className="hidden lg:flex items-center gap-8 text-sm" id="desktop-nav-links">
            {[
              { label: "Home", view: "home" },
              { label: t('marketplace'), view: "marketplace" },
              { label: t('dashboard'), view: "dashboard", isProtected: true },
              { label: "IVR Broadcast campaigns", view: "ivr", isProtected: true },
              { label: t('pricing'), view: "pricing" }
            ].map((link) => {
              const isActive = activeView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => link.isProtected ? handleProtectedAction(link.view as AppView) : setActiveView(link.view as AppView)}
                  className={`relative py-2 font-bold transition-all hover:text-white cursor-pointer ${
                    isActive ? 'text-primary-400' : 'text-[#a3c4b0]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls Area */}
          <div className="flex items-center gap-4" id="header-right-controls">
            
            {/* Native Multi language Context dropdown button switcher */}
            <div className="relative group shrink-0" id="native-lang-box">
              <button 
                type="button"
                className="h-9 px-3 rounded-lg bg-black/40 border border-border-subtle text-text-secondary text-xs font-bold hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-primary-400" />
                <span className="uppercase text-[11px] tracking-wide">{lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'English'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              <div className="absolute right-0 top-10 w-36 rounded-xl border border-border-subtle bg-bg-elevated p-1.5 shadow-2xl scale-0 group-hover:scale-100 origin-top-right transition-transform duration-200 z-50">
                <button 
                  onClick={() => handleLanguageChange('mr')}
                  className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-bold transition-colors ${lang === 'mr' ? 'bg-primary-600/30 text-primary-300' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                >
                  मराठी (महाराष्ट्र)
                </button>
                <button 
                  onClick={() => handleLanguageChange('hi')}
                  className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-bold transition-colors ${lang === 'hi' ? 'bg-primary-600/30 text-primary-300' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                >
                  हिन्दी (Hindi)
                </button>
                <button 
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full py-1.5 px-3 rounded-lg text-left text-xs font-bold transition-colors ${lang === 'en' ? 'bg-primary-600/30 text-primary-300' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Notification Bell alert hub when logged in */}
            {user && (
              <div className="relative shrink-0" id="notification-hub-bell">
                <button 
                  type="button"
                  onClick={() => setIsBellOpen(!isBellOpen)}
                  className="h-9 w-9 rounded-lg bg-black/40 border border-border-subtle text-text-secondary hover:text-white hover:border-text-muted-theme transition-all flex items-center justify-center relative cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>

                {isBellOpen && (
                  <div className="absolute right-0 top-11 w-72 rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-2xl z-50 space-y-3">
                    <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                      <span className="text-xs font-bold text-white">Seasonal System Alerts</span>
                      <button onClick={() => setNotifications([])} className="text-[10px] text-accent-400 hover:underline">Clear all</button>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((not, idx) => (
                          <div key={idx} className="text-xs bg-black/20 p-2 rounded-lg border border-border-subtle/50 space-y-1">
                            <p className="text-text-primary leading-relaxed">{not.text}</p>
                            <span className="text-[9px] text-text-muted-theme block">{not.time}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-[11px] text-text-muted-theme py-4">No new alerts. Your crops are running fine!</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth Session Login state trigger */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3 shrink-0" id="logged-user-ribbon">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center font-bold text-xs text-white">
                    {user.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold leading-none">{user.name}</div>
                    <span className="text-[9px] uppercase tracking-wider text-accent-400 font-bold block mt-0.5">{user.role}</span>
                  </div>
                </button>

                <button 
                  onClick={handleSignOut}
                  title={t('logout')}
                  className="h-8 w-8 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-900/30 hover:text-white transition-colors flex items-center justify-center cursor-pointer border border-red-900/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="hidden sm:flex h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-xs items-center gap-1.5 uppercase tracking-widest cursor-pointer transition-transform duration-100 hover:-translate-y-0.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </button>
            )}

            {/* Hamburger (Mobile only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-9 w-9 rounded-lg bg-black/40 border border-border-subtle hover:border-[#4ade80] text-[#a3c4b0] hover:text-white flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Toggle mobile responsive navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bg-bg-primary/95 backdrop-blur-lg border-b border-border-subtle p-6 space-y-4 z-40 animate-fade-in">
            <div className="space-y-3">
              {[
                { label: "Home Base", view: "home" },
                { label: t('marketplace'), view: "marketplace" },
                { label: t('dashboard'), view: "dashboard", isProtected: true },
                { label: "Voice Broadcasting", view: "ivr", isProtected: true },
                { label: t('pricing'), view: "pricing" }
              ].map((link) => (
                <button
                  key={link.view}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    link.isProtected ? handleProtectedAction(link.view as AppView) : setActiveView(link.view as AppView);
                  }}
                  className={`block w-full py-2 text-left font-bold text-sm ${
                    activeView === link.view ? 'text-primary-400' : 'text-text-secondary'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-border-subtle" />

            {user ? (
              <div className="space-y-3.5">
                <div className="flex gap-2.5 items-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 flex items-center justify-center font-bold text-white uppercase text-xs">
                    {user.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-black">{user.name}</div>
                    <span className="text-xs text-accent-400 uppercase tracking-widest font-black leading-none">{user.role}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full h-11 rounded-lg bg-red-950/20 text-red-400 font-bold text-xs uppercase cursor-pointer"
                >
                  Sign Out of Account
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full h-11 rounded-lg bg-primary-600 text-white font-extrabold text-xs uppercase tracking-widest cursor-pointer"
              >
                Authenticate Securely
              </button>
            )}
          </div>
        )}
      </nav>

      {/* 3. DYNAMIC PAGES SWITCH BOARD VIEW PORTAL */}
      <main className="min-h-[80vh] pb-16" id="root-dynamic-content">
        
        {activeView === 'home' && (
          <LandingPage 
            lang={lang} 
            t={t} 
            onNavigate={(v) => setActiveView(v)} 
            onRegisterClick={() => {
              setAuthMode('signup');
              setIsAuthModalOpen(true);
            }}
            onPostJobClick={() => setActiveView('dashboard')}
            onIvrBroadcastClick={() => handleProtectedAction('ivr')}
            onActivityLog={addActivityLog}
          />
        )}

        {activeView === 'marketplace' && (
          <Marketplace 
            lang={lang} 
            t={t} 
            appliedJobIds={appliedJobIds}
            onApplyJob={handleApplyJob}
            onActivityLog={addActivityLog}
          />
        )}

        {activeView === 'dashboard' && user && (
          <Dashboard 
            lang={lang} 
            t={t} 
            user={user}
            onChangeRole={handleChangeRole}
            onPostJobClick={() => alert("Creating custom jobs is enabled securely! Fill and post inside Marketplace.")}
            onIvrBroadcastClick={() => setActiveView('ivr')}
            onBrowseMarketplaceClick={() => setActiveView('marketplace')}
            onUpgradePrompt={() => setIsUpgradeOpen(true)}
            activityLogs={activityLogs}
            appliedJobIds={appliedJobIds}
          />
        )}

        {activeView === 'ivr' && (
          <IVRBroadcast 
            lang={lang} 
            t={t} 
            isPremium={user?.isPremium || false}
            onUpgradePrompt={() => setIsUpgradeOpen(true)}
            onActivityLog={addActivityLog}
          />
        )}

        {activeView === 'pricing' && (
          <div className="container mx-auto px-4 py-16 max-w-7xl text-center space-y-12">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Fair Subscriptions for Regional growth</h1>
              <p className="text-sm md:text-base text-text-secondary mt-2">Zero commission brokers. Fully support local farm operations with guaranteed escrow payment protection.</p>
            </div>
            
            {/* Display identical high-fidelity pricing grid of Landing page here for page consistency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Kanban standard panels copy */}
              {[
                { title: t('kisanBasic'), rate: t('freeVal'), text: "Post up to 5 jobs monthly. Basic translation features. Support via direct messaging forums.", featured: false },
                { title: t('kisanPro'), rate: t('proVal'), text: "Unlimited jobs postings and automated AI matching list. Smart IVR Broadcast Campaign in regional languages.", featured: true },
                { title: t('kisanEnterprise'), rate: t('entVal'), text: "centralized supervisor login dashboards. Crop machinery API integrations. Dedicated account managers.", featured: false }
              ].map((tier, idx) => (
                <div 
                  key={idx} 
                  className={`glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between text-left space-y-6 ${
                    tier.featured 
                      ? 'border-accent-500/50 bg-[#0e1612] shadow-[0_0_25px_rgba(245,158,11,0.1)] md:scale-105' 
                      : 'border-border-subtle bg-black/20'
                  }`}
                >
                  <div className="space-y-4">
                    <span className={`text-base font-bold ${tier.featured ? 'text-accent-400' : 'text-text-secondary'}`}>{tier.title}</span>
                    <div className="text-2xl font-black text-white font-mono">{tier.rate}</div>
                    <p className="text-xs text-text-secondary">{tier.text}</p>
                    <div className="h-px bg-border-subtle" />
                    <ul className="space-y-2 text-xs text-text-primary">
                      <li className="flex items-center gap-1.5">✓ Identity check verified list</li>
                      <li className="flex items-center gap-1.5">✓ Standard Escrow Protection</li>
                      <li className="flex items-center gap-1.5">✓ Local tehsil maps reference</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (user) {
                        if (tier.featured) handleUpgradeToPro();
                        else alert("Successfully configured your plan!");
                      } else {
                        setIsAuthModalOpen(true);
                      }
                    }}
                    className={`w-full h-11 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer ${
                      tier.featured ? 'bg-accent-500 text-earth-950 hover:bg-accent-400' : 'border border-border-subtle hover:bg-white/5 text-white'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. SYSTEM FOOLPROOF FOOTER SECTION */}
      <footer className="border-t border-border-subtle bg-[#080d0b] py-14" id="footer-terminal">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          {/* Col 1 Brand credits */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="KisanBandhu Logo" className="h-8 object-contain bg-white rounded p-1" />
              <span className="text-white font-extrabold text-sm md:text-base font-heading">
                {t('appName')}
              </span>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Establishing next-generation digital trust frameworks for agricultural workers, smallholder farm owners, and contractor crews. Powered by absolute transparency.
            </p>

            <div className="text-xs text-primary-400 font-bold inline-flex items-center gap-1">
              <span>🌱 Made with love in agricultural India</span>
            </div>
          </div>

          {/* Col 2 Utilities links */}
          <div className="md:col-span-2.5 space-y-3.5 text-xs font-medium">
            <span className="text-white font-bold block uppercase tracking-wider text-[11px]">Platform modules</span>
            <ul className="space-y-2.5 text-text-secondary">
              <li><button onClick={() => setActiveView('marketplace')} className="hover:text-white hover:underline transition-colors block">Browse Marketplace</button></li>
              <li><button onClick={() => handleProtectedAction('ivr')} className="hover:text-white hover:underline transition-colors block">IVR Voice broadcast</button></li>
              <li><button onClick={() => handleProtectedAction('dashboard')} className="hover:text-white hover:underline transition-colors block font-sans">Farmer Dashboards</button></li>
              <li><button onClick={() => handleProtectedAction('dashboard')} className="hover:text-white hover:underline transition-colors block">Worker Resumes</button></li>
            </ul>
          </div>

          {/* Col 3 Resources links */}
          <div className="md:col-span-2.5 space-y-3.5 text-xs font-medium">
            <span className="text-white font-bold block uppercase tracking-wider text-[11px]">Legal Frameworks</span>
            <ul className="space-y-2.5 text-text-secondary">
              <li><a href="#rules" className="hover:text-white hover:underline block">Advisory Guidelines</a></li>
              <li><a href="#rules" className="hover:text-white hover:underline block">Privacy & SSL Security</a></li>
              <li><a href="#rules" className="hover:text-white hover:underline block">State Grievance Panel</a></li>
              <li><a href="#rules" className="hover:text-white hover:underline block">API Developers sandbox</a></li>
            </ul>
          </div>

          {/* Col 4 Newsletter input */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-white font-bold block uppercase tracking-wider text-[11px]">Seasons newsletters</span>
            <p className="text-xs text-text-secondary leading-relaxed">Get direct market crop prices indices delivered weekly straight to inbox channels.</p>
            
            <div className="flex gap-2 text-xs">
              <input 
                type="email"
                placeholder="Enter email address"
                className="h-10 px-3 rounded-lg text-white bg-black/40 border border-border-subtle focus:border-primary-500 transition-all outline-none w-full placeholder-text-muted-theme"
              />
              <button 
                onClick={() => alert("Successfully registered for weekly seasonal indices.")}
                className="h-10 px-4 rounded-lg bg-accent-500 hover:bg-accent-400 text-earth-950 font-black tracking-wide shrink-0 transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-text-muted-theme font-mono">
          <span>© 2026 Krushi Rojgar Sandhi Co-op. Securely encrypted with AES-256 TLS protocols.</span>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:underline hover:text-white">Terms of Agricultural Welfare</a>
            <span>•</span>
            <a href="#privacy" className="hover:underline hover:text-white">Fair Contracting guidelines</a>
          </div>
        </div>
      </footer>


      {/* 5. GORGEOUS SPLIT-COLS SIGNUP/LOGIN AUTH MODAL DIALOG */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-4xl w-full rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border-slate-200 shadow-2xl relative min-h-[500px]"
          >
            {/* Close absolute button */}
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-800 hover:text-indigo-600 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Dismiss auth dialog"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>

            {/* Left Col Decoratives - spans 5 columns */}
            <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-8 flex flex-col justify-between border-r border-slate-200 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-24 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10 text-white">
                <div className="bg-white rounded-xl p-2 inline-block shadow-md">
                  <img src="/logo.png" alt="KisanBandhu Logo" className="h-10 object-contain" />
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">Securing Farmers & Workers Livelihood</h3>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Join a trusted government-verified cooperative network facilitating daily wage agreements, insurance parameters, and direct-to-bank mobile settlements.
                </p>
              </div>

              {/* Verified Badge and safety lock */}
              <div className="space-y-4 pt-6 md:pt-0 relative z-10">
                <div className="flex gap-2 items-center text-xs text-indigo-200 font-bold bg-indigo-900/40 p-3 rounded-xl border border-indigo-700/20">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-indigo-400" />
                  <span>Verified Identity Check Secured via OTP system.</span>
                </div>
                <div className="text-[10px] text-indigo-300 font-mono">
                  🔒 SSL 256-BIT ENCRYPTED CONNECTION
                </div>
              </div>
            </div>

            {/* Right Col interactive Form fields - spans 7 columns */}
            <form onSubmit={handleAuthSubmit} className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center space-y-5 text-left bg-white">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">
                  {authMode === 'login' ? t('welcomeBack') : t('createAccount')}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {authMode === 'login' ? t('signinSub') : 'Set up your verified agricultural profile under 2 minutes.'}
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <span className="font-bold shrink-0">⚠️ Error:</span> 
                  <span>{authError}</span>
                </div>
              )}

              {/* Signup role select cards badge */}
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    {t('roleLabel')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'farmer', emoji: '🌾', label: t('farmerRole') },
                      { role: 'worker', emoji: '👷', label: 'Worker' },
                      { role: 'contractor', emoji: '📋', label: 'Contractor' }
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setRegRole(item.role as any)}
                        className={`p-3 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          regRole === item.role 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' 
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-600/50'
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-[10px] font-bold tracking-tight block truncate w-full">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unified fields inputs stack */}
              <div className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {t('nameInput')}
                    </label>
                    <input 
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl text-slate-900 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs text-medium"
                      placeholder="e.g. Laxman Tukaram Gaikwad"
                    />
                  </div>
                )}

                {/* Indian Phone input with +91 indicator */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {t('phoneInput')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 select-none flex items-center gap-1 border-r border-slate-200 pr-2">
                      🇮🇳 +91
                    </span>
                    <input 
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={authMode === 'login' ? logPhone : regPhone}
                      onChange={(e) => authMode === 'login' ? setLogPhone(e.target.value) : setRegPhone(e.target.value)}
                      className="w-full h-11 pl-18 pr-4 rounded-xl text-slate-900 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs font-mono"
                      placeholder="98201 22301"
                      title="Please enter a 10 digit Indian number"
                    />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 italic-none">
                    *Tip: Use phone suffix <strong>22301</strong> or <strong>Rajesh</strong> to login or bypass instant demo access!
                  </div>
                </div>

                {/* District selecting for signup */}
                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        State
                      </label>
                      <select className="w-full h-11 px-3 rounded-xl text-slate-900 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs">
                        <option value="MH">Maharashtra</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Home District
                      </label>
                      <select 
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl text-slate-900 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs text-medium"
                      >
                        <option value="Nashik">Nashik (नाशिक)</option>
                        <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                        <option value="Pune">Pune (पुणे)</option>
                        <option value="Nagpur">Nagpur (नागपूर)</option>
                        <option value="Satara">Satara (सातारा)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {t('passInput')}
                  </label>
                  <input 
                    type="password"
                    required
                    value={authMode === 'login' ? logPassword : regPassword}
                    onChange={(e) => authMode === 'login' ? setLogPassword(e.target.value) : setRegPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl text-slate-900 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 text-white font-black text-xs uppercase tracking-widest hover:shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition-all cursor-pointer"
              >
                {authMode === 'login' ? t('signinBtn') : t('btnSignup')}
              </button>

              {/* Register switch footer link */}
              <div className="text-center text-xs space-y-2 pt-2 text-slate-500">
                <span>{authMode === 'login' ? t('dontHaveAcc') : t('haveAcc')} </span>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  {authMode === 'login' ? t('signupLink') : t('login')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. IMMERSIVE PRO BILLING UPGRADE MODAL */}
      {isUpgradeOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-md w-full rounded-2xl p-6 md:p-8 border-indigo-600 text-center space-y-6 relative bg-white"
          >
            <button 
              onClick={() => setIsUpgradeOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="p-3.5 bg-indigo-50 rounded-full inline-block text-indigo-600">
              <Sparkles className="w-8 h-8 mx-auto animate-pulse" />
            </span>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">{t('kisanPro')} Upgrade Channel</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Supercharge your agricultural output with automated matching and speech broadcast capabilities.
              </p>
            </div>

            {/* Plan rates comparison card in billing */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wide">Monthly rate:</span>
                <span className="font-mono text-xl font-bold text-indigo-600">₹999 / mo</span>
              </div>
              <div className="h-px bg-slate-200" />
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Unlimited IVR Voice Broadcast Dial-Outs</span>
                </li>
                <li className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>AI Matching priority alerts list</span>
                </li>
                <li className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Interactive operations graph dashboard</span>
                </li>
              </ul>
            </div>

            <p className="text-[10px] text-slate-400">
              Escrow payment release is powered securely. Cancel subscription agreements directly anytime instantly.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(false)}
                className="h-11 rounded-xl bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold text-xs"
              >
                Cancel Upgrade
              </button>
              
              <button
                type="button"
                onClick={handleUpgradeToPro}
                className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
              >
                Secure billing call
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
