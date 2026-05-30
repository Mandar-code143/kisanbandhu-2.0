/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  BadgeIndianRupee, 
  Sparkles, 
  MapPin, 
  ChevronRight, 
  Star, 
  ChevronLeft, 
  ArrowRight, 
  Smartphone,
  Flame,
  Volume2,
  Check,
  TrendingUp,
  X,
  Play
} from 'lucide-react';
import { Language } from '../types';

interface LandingPageProps {
  lang: Language;
  t: (key: string) => string;
  onNavigate: (view: any) => void;
  onRegisterClick: () => void;
  onPostJobClick: () => void;
  onIvrBroadcastClick: () => void;
  onActivityLog: (type: 'job_posted' | 'application_received' | 'job_accepted' | 'payment_processed' | 'ivr_launched', title: string, desc: string) => void;
}

export default function LandingPage({ 
  lang, 
  t, 
  onNavigate, 
  onRegisterClick, 
  onPostJobClick, 
  onIvrBroadcastClick,
  onActivityLog
}: LandingPageProps) {

  // Tilt coordinates for right-column 3D dashboard card mockup
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16; // tilt range -8 to 8
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Testimonial Carousel state
  const testimonials = [
    {
      name: "Rajesh Patil",
      role: "Farmer, Nashik",
      content: t('testimonial1'),
      stars: 5,
      init: "RP"
    },
    {
      name: "Sunita Deshmukh",
      role: "Agricultural Worker, Pune",
      content: t('testimonial2'),
      stars: 5,
      init: "SD"
    },
    {
      name: "Manoj Kumar",
      role: "Sugarcane Contractor, Kolhapur",
      content: t('testimonial3'),
      stars: 5,
      init: "MK"
    }
  ];
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIdx(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Animated Countup numbers state simulations
  const [counts, setCounts] = useState({ farmers: 0, workers: 0, lakhs: 0, score: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCounts({
        farmers: 52400,
        workers: 124000,
        lakhs: 154,
        score: 98
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-24" id="landing-page-root">
      
      {/* 1. HERO SECTION */}
      <section 
        className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden" 
        style={{ background: 'var(--gradient-hero)' }}
        id="hero-banner"
      >
        {/* Background Dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#2a3f30_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20">
          
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-6 text-left" id="hero-left-column">
            
            {/* Animated Pill Tag */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-[#4ade80] bg-primary-950/40 border border-primary-500/20 shadow-lg shrink-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{t('trustBadge')}</span>
            </motion.div>

            {/* Headline with gorgeous gradient word fill */}
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
              <span className="text-gradient font-heading">{t('heroTitlePart1')}</span>
              <br />
              <span className="text-2xl md:text-4xl font-light text-text-secondary font-heading mt-2 block">{t('heroTitlePart2')}</span>
            </h1>

            {/* Subtitle description */}
            <p className="text-sm md:text-lg text-text-secondary leading-relaxed max-w-2xl font-body">
              {t('heroSubtitle')}
            </p>

            {/* Parallel Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <button
                type="button"
                onClick={onRegisterClick}
                className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white font-bold text-base hover:shadow-[0_0_25px_rgba(34,197,94,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('getStartedButton')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDemoVideoOpen(true)}
                className="h-14 px-8 rounded-xl bg-black/40 border border-emerald-900 text-white font-semibold text-sm hover:bg-black/60 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>{t('watchDemoButton')}</span>
              </button>
            </div>

            {/* Agricultural Trust markers */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs text-text-muted-theme pt-4">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                {t('trustItem1')}
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                {t('trustItem2')}
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                {t('trustItem3')}
              </span>
            </div>
          </div>

          {/* Right Column Interactive 3D Mockup */}
          <div 
            className="lg:col-span-5 flex justify-center items-center" 
            id="hero-right-column"
          >
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[420px] transition-transform duration-200 ease-out py-8"
              style={{
                perspective: '1200px',
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
              }}
            >
              {/* Backing Ambient blurred circles pulsing */}
              <div className="absolute -inset-4 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />

              {/* Master Dashboard Glassmorphic Card Mockup */}
              <div className="glass-card hover:border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative border-emerald-950/70 overflow-hidden w-full space-y-5 animate-timer-shrink-none">
                
                {/* Simulated macOS Dots bar top */}
                <div className="flex justify-between items-center border-b border-subtle pb-3 shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/60" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <span className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 tracking-wider bg-emerald-950/50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/20">
                    <span className="rounded-full bg-emerald-400 w-1.5 h-1.5 animate-ping mx-0.5" />
                    <span>{t('mockOnline')}</span>
                  </div>
                </div>

                {/* Simulated Dashboard Header info */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <div className="text-white font-black text-sm">{t('mockDashboard')}</div>
                    <div className="text-[10px] text-text-muted-theme mt-0.5">Tehsil: Junnar, Pune (MH)</div>
                  </div>
                  <Smartphone className="w-4 h-4 text-secondary text-primary-400 animate-bounce" />
                </div>

                {/* Dashboard Stats mock metrics row */}
                <div className="grid grid-cols-3 gap-2 text-center text-white shrink-0">
                  <div className="bg-[#0b100e] border border-subtle/50 p-2.5 rounded-xl">
                    <div className="text-[10px] uppercase font-semibold text-text-secondary truncate">Active Jobs</div>
                    <span className="text-base font-black font-mono text-primary-400">12</span>
                  </div>
                  <div className="bg-[#0b100e] border border-subtle/50 p-2.5 rounded-xl">
                    <div className="text-[10px] uppercase font-semibold text-text-secondary truncate">Verified Crews</div>
                    <span className="text-base font-black font-mono text-accent-400">48</span>
                  </div>
                  <div className="bg-[#0b100e] border border-subtle/50 p-2.5 rounded-xl">
                    <div className="text-[10px] uppercase font-semibold text-text-secondary truncate font-sans">Payout Disbursed</div>
                    <span className="text-base font-black font-mono text-white">₹24K</span>
                  </div>
                </div>

                {/* Simulated Growth Chart Vector */}
                <div className="space-y-1.5">
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex justify-between">
                    <span>{t('mockChartTitle')}</span>
                    <span className="text-primary-400 font-mono">+18% season growth</span>
                  </div>
                  <div className="h-24 w-full bg-black/60 rounded-xl relative p-2 overflow-hidden flex flex-col justify-end">
                    <svg className="w-full h-16 transform scale-y-[0.8] origin-bottom overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="popGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 30 L 0 25 Q 20 12 35 20 T 70 8 T 100 15 L 100 30 Z" fill="url(#popGlow)" />
                      <path d="M 0 25 Q 20 12 35 20 T 70 8 T 100 15" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="flex justify-between text-[8px] font-mono text-text-muted-theme border-t border-subtle/40 pt-1 mt-1">
                      <span>Harvest Start</span>
                      <span>Mid peak</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Recent worker proposed feedback */}
                <div className="space-y-2">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Recent Activity Proposals</span>
                  <div className="divide-y divide-subtle/30 bg-[#090d0b] rounded-xl px-3 border border-subtle">
                    <div className="py-2 flex items-center justify-between text-[11px] gap-2">
                      <span className="text-white font-bold truncate">Suresh G. (Nashik)</span>
                      <span className="text-primary-400 font-bold bg-primary-950/40 px-2 py-0.5 rounded text-[9px]">Grafting • Applied</span>
                    </div>
                    <div className="py-2 flex items-center justify-between text-[11px] gap-2">
                      <span className="text-white font-bold truncate">Aniket J. (Kolhapur)</span>
                      <span className="text-accent-400 font-bold bg-accent-950/40 px-2 py-0.5 rounded text-[9px]">Sugarcane • Applied</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SYSTEM COUNTERS STATISTICAL BAR */}
      <section className="bg-black/40 border-y border-subtle py-10" id="stats-ribbon">
        <div className="container mx-auto px-4 max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { tag: t('c1Val'), label: t('c1Lbl') },
            { tag: t('c2Val'), label: t('c2Lbl') },
            { tag: t('c3Val'), label: t('c3Lbl') },
            { tag: t('c4Val'), label: t('c4Lbl') }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-3xl md:text-5xl font-black text-primary-400 font-mono tracking-tight glow-primary-glow-none">
                {item.tag}
              </div>
              <div className="text-xs md:text-sm text-text-secondary font-medium uppercase tracking-wide">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CORE BENEFITS/FEATURES SECTION */}
      <section className="container mx-auto px-4 max-w-7xl space-y-12" id="key-aspects-grid">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-accent-400 uppercase tracking-widest block">
            {t('featuresOverline')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {t('featuresHeadline')}
          </h2>
          <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t('featuresSubtitle')}
          </p>
        </div>

        {/* Dynamic Card Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: t('f1Title'), desc: t('f1Desc'), color: 'from-amber-600/30' },
            { title: t('f2Title'), desc: t('f2Desc'), color: 'from-emerald-600/30' },
            { title: t('f3Title'), desc: t('f3Desc'), color: 'from-purple-600/30' },
            { title: t('f4Title'), desc: t('f4Desc'), color: 'from-blue-600/30' },
            { title: t('f5Title'), desc: t('f5Desc'), color: 'from-green-600/30' },
            { title: t('f6Title'), desc: t('f6Desc'), color: 'from-yellow-600/30' }
          ].map((item, i) => (
            <motion.div
              layout
              key={i}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-primary-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all duration-300 relative min-h-[260px] cursor-pointer"
            >
              <div className="space-y-4">
                <div className={`p-3 w-max rounded-xl bg-gradient-to-br ${item.color} to-transparent border border-white/5`}>
                  <Flame className="w-5 h-5 text-semibold text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Sub link animation */}
              <button 
                type="button" 
                onClick={onRegisterClick}
                className="text-xs text-accent-400 font-bold hover:underline justify-end mt-4 inline-flex items-center gap-0.5 cursor-pointer"
              >
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. CAROUSEL TESTIMONIALS SECTION */}
      <section className="container mx-auto px-4 max-w-7xl text-center space-y-12" id="user-testimonials">
        <div className="space-y-2">
          <span className="text-xs font-bold text-accent-400 uppercase tracking-widest block">{t('testimonialsOverline')}</span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">{t('testimonialsHeadline')}</h2>
        </div>

        {/* Carousel layout cards frame */}
        <div className="max-w-3xl mx-auto relative px-4 md:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonialIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-3xl p-6 md:p-10 border-primary-500/20 text-center space-y-6 relative overflow-hidden shadow-2xl"
            >
              <div className="text-6xl text-accent-500/10 font-black absolute top-4 left-4 font-mono select-none pointer-events-none">❝</div>
              
              <p className="text-base md:text-lg text-white leading-relaxed italic-none font-medium">
                "{testimonials[activeTestimonialIdx].content}"
              </p>

              {/* Star Rating stack */}
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-accent-400 text-accent-400" />
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-subtle to-transparent" />

              {/* Verified identity avatar row */}
              <div className="flex gap-3 justify-center items-center">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center font-bold text-sm text-white">
                  {testimonials[activeTestimonialIdx].init}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-white">{testimonials[activeTestimonialIdx].name}</div>
                  <div className="text-xs text-text-secondary">{testimonials[activeTestimonialIdx].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel arrow triggers */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setActiveTestimonialIdx(prev => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-3.5 rounded-full border border-subtle bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTestimonialIdx(prev => (prev + 1) % testimonials.length)}
              className="p-3.5 rounded-full border border-subtle bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. PRICING TIERING MATRIX SECTION */}
      <section className="container mx-auto px-4 max-w-7xl space-y-12" id="subscription-tiers">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-accent-400 uppercase tracking-widest block">
            {t('pricingOverline')}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {t('pricingHeadline')}
          </h2>
        </div>

        {/* High elegance 3 column pricing matrix grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Kisan Basic */}
          <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6 border-subtle bg-black/20 text-left">
            <div className="space-y-4">
              <span className="text-base font-bold text-text-secondary tracking-normal">{t('kisanBasic')}</span>
              <div className="text-3xl font-black text-white font-mono">{t('freeVal')}</div>
              <p className="text-xs text-text-secondary leading-relaxed">For small individual holding farmers finding essential local harvesting assistance.</p>
              <div className="h-px bg-subtle" />
              
              <ul className="space-y-3 text-xs text-text-primary">
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>{t('pFeature1')}</span>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>{t('pFeature2')}</span>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>{t('pFeature3')}</span>
                </li>
                <li className="flex gap-2 items-center text-text-muted-theme line-through">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{t('pFeature6')}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onRegisterClick}
              className="w-full h-11 rounded-lg border border-subtle hover:border-primary-500 text-white font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/5 cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Kisan Pro - Highlights with Gold Badge glow */}
          <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6 relative border-accent-500/50 bg-[#0e1612] text-left transform md:-translate-y-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <span className="absolute top-4 right-4 text-[9px] font-black uppercase bg-accent-500 text-earth-950 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-earth-950 text-earth-950" />
              {t('mostPopular')}
            </span>

            <div className="space-y-4">
              <span className="text-base font-extrabold text-accent-400 tracking-normal">{t('kisanPro')}</span>
              <div className="text-3xl font-black text-white font-mono">{t('proVal')}</div>
              <p className="text-xs text-emerald-100/70 leading-relaxed">Highly utilized by progress agriculturalists scaling output over larger multi-acre holdings.</p>
              <div className="h-px bg-subtle" />

              <ul className="space-y-3 text-xs text-text-primary">
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-accent-400 shrink-0" />
                  <strong>{t('pFeature5')}</strong>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-accent-400 shrink-0" />
                  <strong>{t('pFeature6')} (Marathi/Hindi)</strong>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-accent-400 shrink-0" />
                  <span>{t('pFeature7')}</span>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-accent-400 shrink-0" />
                  <span>{t('pFeature8')}</span>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-accent-400 shrink-0" />
                  <span>{t('pFeature9')}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onRegisterClick}
              className="w-full h-12 rounded-lg bg-accent-500 text-earth-950 font-black text-xs uppercase tracking-widest transition-all hover:bg-accent-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              Unlock Kisan Pro
            </button>
          </div>

          {/* Kisan Enterprise */}
          <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6 border-subtle bg-black/20 text-left">
            <div className="space-y-4">
              <span className="text-base font-bold text-text-secondary tracking-normal">{t('kisanEnterprise')}</span>
              <div className="text-3xl font-black text-white font-mono">{t('entVal')}</div>
              <p className="text-xs text-text-secondary leading-relaxed">Integrated supervisors, agricultural cooperative societies, machinery suppliers and large-scale contractors.</p>
              <div className="h-px bg-subtle" />

              <ul className="space-y-3 text-xs text-text-primary">
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>{t('pFeature10')}</span>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>{t('pFeature11')}</span>
                </li>
                <li className="flex gap-2 items-center">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  <span>{t('pFeature12')}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onRegisterClick}
              className="w-full h-11 rounded-lg border border-subtle hover:border-primary-500 text-white font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/5 cursor-pointer"
            >
              Inquire Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* 6. CALL-TO-ACTION IMMERSIVE CARD BANNER */}
      <section className="container mx-auto px-4 max-w-5xl" id="immersive-cta">
        <div className="relative rounded-3xl p-8 md:p-14 bg-gradient-to-tr from-emerald-950 via-[#111c16] to-[#12281d] border border-primary-500/25 overflow-hidden text-center space-y-6 shadow-2xl">
          {/* Radial backdrop light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-28 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            {t('ctaTitle')}
          </h2>
          <p className="text-sm md:text-base text-emerald-100/70 max-w-xl mx-auto leading-relaxed font-body">
            {t('ctaSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center pt-4">
            <button
              onClick={onRegisterClick}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all cursor-pointer"
            >
              {t('ctaStart')}
            </button>
            <button
              onClick={onRegisterClick}
              className="h-12 px-8 rounded-xl border border-subtle bg-black/40 text-white font-bold text-xs hover:bg-black/60 transition-colors cursor-pointer"
            >
              {t('ctaInquire')}
            </button>
          </div>

          <p className="text-[11px] text-text-muted-theme">
            {t('ctaSubtext')}
          </p>
        </div>
      </section>

      {/* Demo Video Popup modal */}
      {isDemoVideoOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-2xl p-6 space-y-4 border-emerald-900 text-center relative">
            <button 
              onClick={() => setIsDemoVideoOpen(false)}
              className="absolute top-3 right-3 text-white/75 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-gradient">Krushi Rojgar Sandhi - Demo Walkthrough</h3>
            
            {/* Simulated offline demo placeholder box */}
            <div className="h-64 rounded-xl bg-black border border-subtle flex flex-col items-center justify-center space-y-3 relative group overflow-hidden">
              <div className="p-4 rounded-full bg-primary-600 text-white animate-pulse">
                <Play className="w-8 h-8 fill-white" />
              </div>
              <div className="z-10 text-xs font-mono text-primary-400">// SIMULATED HD PLAYBACK ENVIRONMENT</div>
              <p className="text-[11px] text-text-secondary max-w-xs leading-relaxed">
                Illustrating automated voice broadcast algorithms connecting farm fields with local crew supervisors.
              </p>
            </div>

            <button
              onClick={() => setIsDemoVideoOpen(false)}
              className="w-full h-11 mt-4 rounded-xl bg-earth-800 text-white font-bold text-xs"
            >
              Dismiss Walkthrough
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
