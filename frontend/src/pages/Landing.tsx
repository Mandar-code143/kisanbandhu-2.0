import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Leaf, Users, Tractor, Cloud, Shield, Star, Phone, Globe,
  ArrowRight, ChevronRight, CheckCircle2, Sprout, Zap,
  MessageSquare, Headphones, MapPin, TrendingUp, Smartphone, Mic
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import { ParticleField } from '@/components/animations/ParticleField';
import { GlowCard, FloatingElement } from '@/components/animations/GlowCard';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';

export default function Landing() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center pb-16 pt-12 md:pb-24 md:pt-20">
        <ParticleField count={30} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container relative">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="text-xs font-semibold text-primary">Live in 2,400+ villages across Maharashtra</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                <span className="block">{t('landing.hero.title', language).split(' ').slice(0, 3).join(' ')}</span>
                <span className="block text-gradient-hero mt-2">{t('landing.hero.title', language).split(' ').slice(3).join(' ')}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                {t('landing.hero.subtitle', language)}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" onClick={() => navigate('/signup')} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-7 shadow-glow relative overflow-hidden group">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {t('landing.hero.cta.start', language)} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="gap-2 backdrop-blur-sm">
                    {t('landing.hero.cta.hire', language)}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8 flex items-center gap-6 text-sm text-muted-foreground"
              >
                {[
                  { icon: CheckCircle2, text: 'Free to use', color: 'text-success' },
                  { icon: Globe, text: '3 languages', color: 'text-primary' },
                  { icon: Shield, text: 'Verified workers', color: 'text-accent' },
                ].map((item, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-1.5"
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} /> {item.text}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Right — floating stat cards */}
            <div className="relative hidden lg:block">
              <div className="absolute -right-8 -top-8 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -left-4 bottom-4 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {[
                    { icon: Users, value: 18000, suffix: '+', label: 'Registered Workers', delay: 0 },
                    { icon: CheckCircle2, value: 45000, suffix: '+', label: 'Successful Hires', delay: 0.2, color: 'text-success', bg: 'bg-success/10' },
                  ].map((card, i) => (
                    <FloatingElement key={i} delay={card.delay}>
                      <GlowCard className="border border-border bg-card p-5 shadow-card">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg || 'bg-primary/10'}`}>
                          <card.icon className={`h-5 w-5 ${card.color || 'text-primary'}`} />
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-foreground">
                          <AnimatedCounter value={card.value} suffix={card.suffix} />
                        </div>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                      </GlowCard>
                    </FloatingElement>
                  ))}
                </div>
                <div className="mt-8 space-y-4">
                  {[
                    { icon: Tractor, value: 1200, suffix: '+', label: 'Equipment Listed', delay: 0.1, color: 'text-accent', bg: 'bg-accent/10' },
                    { icon: Star, value: 4.8, suffix: '', label: 'Average Rating', delay: 0.3, color: 'text-warning', bg: 'bg-warning/10', isRating: true },
                  ].map((card, i) => (
                    <FloatingElement key={i} delay={card.delay}>
                      <GlowCard className={`border ${card.isRating ? 'border-warning/20 bg-warning/5' : 'border-border bg-card'} p-5 shadow-card`}>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}>
                          <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <p className="mt-3 text-3xl font-extrabold text-foreground">
                          {card.isRating ? '4.8' : <AnimatedCounter value={card.value as number} suffix={card.suffix} />}
                        </p>
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                      </GlowCard>
                    </FloatingElement>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile stats */}
          <StaggerContainer className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden" staggerDelay={0.08}>
            {[
              { value: 2400, suffix: '+', label: t('landing.stats.villages', language), icon: MapPin },
              { value: 18000, suffix: '+', label: t('landing.stats.workers', language), icon: Users },
              { value: 45000, suffix: '+', label: t('landing.stats.hires', language), icon: CheckCircle2 },
              { value: 1200, suffix: '+', label: t('landing.stats.equipment', language), icon: Tractor },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <div className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
                  <stat.icon className="mx-auto h-4 w-4 text-primary" />
                  <div className="mt-2 text-xl font-bold text-foreground">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </motion.div>
      </section>

      {/* For Whom */}
      <section className="relative border-t border-border bg-muted/30 py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,hsl(var(--primary)/0.04),transparent)]" />
        <div className="container relative">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 rounded-full px-3 py-1">WHO IT'S FOR</span>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-4xl">Built for Every Stakeholder in Agriculture</h2>
          </ScrollReveal>

          <StaggerContainer className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3" staggerDelay={0.15}>
            {[
              {
                emoji: '👨‍🌾', title: 'For Farmers',
                points: ['Post jobs in 2 minutes', 'Find verified workers nearby', 'Rent equipment at best rates', 'Track weather & plan better'],
                cta: 'Start Hiring', ctaAction: () => navigate('/signup'),
                border: 'border-primary/20', bg: 'bg-primary/5', glow: 'hsl(var(--primary))'
              },
              {
                emoji: '👷', title: 'For Workers',
                points: ['Get matched to jobs near you', 'Build your verified profile', 'Track earnings & schedule', 'Get paid fairly & on time'],
                cta: 'Find Work', ctaAction: () => navigate('/signup'),
                border: 'border-accent/20', bg: 'bg-accent/5', glow: 'hsl(var(--accent))'
              },
              {
                emoji: '🚜', title: 'For Equipment Owners',
                points: ['List equipment in minutes', 'Set your own rates', 'Manage booking calendar', 'Earn from idle machinery'],
                cta: 'List Equipment', ctaAction: () => navigate('/signup'),
                border: 'border-earth/20', bg: 'bg-earth/5', glow: 'hsl(var(--earth))'
              },
            ].map((track, i) => (
              <StaggerItem key={i}>
                <GlowCard glowColor={track.glow} className={`border ${track.border} ${track.bg} p-6 h-full`}>
                  <motion.span
                    className="text-4xl block"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 * i }}
                  >
                    {track.emoji}
                  </motion.span>
                  <h3 className="mt-3 text-lg font-bold text-foreground">{track.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {track.points.map((p, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + j * 0.08 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-5">
                    <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={track.ctaAction}>
                      {track.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                </GlowCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/5 rounded-full px-3 py-1">SIMPLE PROCESS</span>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-4xl">Get Started in 3 Steps</h2>
          </ScrollReveal>

          <div className="mx-auto mt-16 flex max-w-4xl flex-col gap-0 md:flex-row md:gap-0">
            {[
              { step: '1', title: 'Create Profile', desc: 'Sign up as farmer or worker. Add your skills, location, and preferences in under 3 minutes.', icon: Users },
              { step: '2', title: 'Post or Apply', desc: 'Farmers post detailed job requirements. Workers browse and apply to matching opportunities.', icon: Zap },
              { step: '3', title: 'Work & Grow', desc: 'Complete jobs, earn money, get rated. Build your reputation and grow your network.', icon: TrendingUp },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.2} className="relative flex-1 border-l-2 border-primary/20 pb-8 pl-8 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-8">
                <motion.div
                  className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-glow md:-top-4 md:left-0"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {item.step}
                </motion.div>
                <div className="md:pr-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative border-t border-border bg-card py-16 md:py-24">
        <ParticleField count={15} className="opacity-50" />
        <div className="container relative">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 rounded-full px-3 py-1">PLATFORM FEATURES</span>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-4xl">Everything You Need, Nothing You Don't</h2>
          </ScrollReveal>

          <div className="mx-auto mt-12 max-w-5xl">
            <div className="grid gap-6 md:grid-cols-2">
              <ScrollReveal variant="fadeLeft">
                <motion.div
                  className="rounded-2xl bg-gradient-hero p-8 text-primary-foreground relative overflow-hidden h-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Phone className="h-8 w-8 text-primary-foreground/70" />
                  </motion.div>
                  <h3 className="mt-4 text-xl font-bold">Voice-First & IVR Support</h3>
                  <p className="mt-2 leading-relaxed text-primary-foreground/80">
                    Post jobs by voice. Notify workers through automated calls. Works even on basic phones with low connectivity.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      { icon: Mic, label: 'Voice Posting' },
                      { icon: Headphones, label: 'IVR Calls' },
                      { icon: Smartphone, label: 'Low Data Mode' },
                    ].map((f, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs font-medium backdrop-blur-sm flex items-center gap-1.5"
                      >
                        <f.icon className="h-3.5 w-3.5" /> {f.label}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </ScrollReveal>

              <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
                {[
                  { icon: Users, title: 'Smart Matching', desc: 'AI-powered worker recommendations based on skills, proximity, and rating' },
                  { icon: Shield, title: 'Trust System', desc: 'Verified profiles, mutual ratings, document checks' },
                  { icon: Cloud, title: 'Weather Intel', desc: 'Hyperlocal forecasts with farming advisories' },
                  { icon: Star, title: 'Govt Schemes', desc: 'Discover eligible schemes with deadline alerts' },
                ].map((f, i) => (
                  <StaggerItem key={i}>
                    <GlowCard className="border border-border bg-background p-4 h-full">
                      <motion.div whileHover={{ rotate: 10 }} transition={{ type: 'spring' }}>
                        <f.icon className="h-5 w-5 text-primary" />
                      </motion.div>
                      <h4 className="mt-2 text-sm font-bold text-foreground">{f.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                    </GlowCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-3" staggerDelay={0.12}>
              {[
                { icon: Tractor, title: 'Equipment Marketplace', desc: 'Rent tractors, harvesters, sprayers. Compare prices and book instantly.' },
                { icon: Globe, title: '3 Languages', desc: 'Full experience in English, Hindi, and Marathi with natural, human translations.' },
                { icon: MessageSquare, title: 'Smart Alerts', desc: 'Job matches, booking updates, weather warnings. Never miss an opportunity.' },
              ].map((f, i) => (
                <StaggerItem key={i}>
                  <GlowCard className="border border-border bg-background p-5 h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <motion.div whileHover={{ scale: 1.2, rotate: -10 }}>
                        <f.icon className="h-5 w-5 text-accent" />
                      </motion.div>
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-foreground">{f.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </GlowCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent bg-accent/5 rounded-full px-3 py-1">REAL STORIES</span>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-4xl">Trusted by Rural India</h2>
          </ScrollReveal>

          <StaggerContainer className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3" staggerDelay={0.15}>
            {[
              { name: 'Rajesh Patil', role: 'Farmer, Baramati', text: 'I found 8 reliable workers for sugarcane harvesting in just 2 hours. Earlier it used to take me days of calling around the village.', rating: 5 },
              { name: 'Sunita Jadhav', role: 'Farm Worker, Indapur', text: 'Now I can plan my work weeks in advance. The daily earnings tracker helps me save better for my children\'s education.', rating: 5 },
              { name: 'Manoj Deshmukh', role: 'Farmer, Ahmednagar', text: 'The equipment rental feature saved me ₹40,000 this season. Rented a harvester instead of hiring 10 workers for 10 days.', rating: 5 },
            ].map((review, i) => (
              <StaggerItem key={i}>
                <GlowCard className={`border border-border bg-card p-6 shadow-card h-full ${i === 1 ? 'md:-mt-6' : ''}`}>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + j * 0.06, type: 'spring' }}
                      >
                        <Star className="h-4 w-4 fill-accent text-accent" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground italic">"{review.text}"</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      {review.name.charAt(0)}
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </GlowCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-border bg-muted/30 py-16 md:py-24 overflow-hidden">
        <ParticleField count={20} className="opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.06),transparent)]" />
        <div className="container relative">
          <ScrollReveal variant="scaleUp" className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl leading-tight">
              Ready to Transform
              <span className="block text-gradient-hero">Agricultural Employment?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
              Join thousands of farmers and workers already using Krushi Rojgar Sandhi. It's free to get started.
            </p>
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" onClick={() => navigate('/signup')} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 shadow-glow relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  Create Free Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="backdrop-blur-sm">
                  Log In to Dashboard
                </Button>
              </motion.div>
            </motion.div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required • Available in English, Hindi, Marathi</p>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
          </ScrollReveal>
          <StaggerContainer className="mx-auto mt-10 max-w-3xl space-y-3" staggerDelay={0.08}>
            {[
              { q: 'Is Krushi Rojgar Sandhi free to use?', a: 'Yes, basic features are completely free for both farmers and workers. Premium features for large farms and enterprise clients are coming soon.' },
              { q: 'How are workers verified?', a: 'Workers upload identity documents (Aadhaar, PAN) which are reviewed by our verification team. Verified workers get a trust badge and appear higher in search results.' },
              { q: 'Which areas do you currently cover?', a: 'We are currently active across Maharashtra including Pune, Nasik, Satara, Ahmednagar, Solapur, and Kolhapur districts. Pan-India expansion is planned for 2027.' },
              { q: 'Can I use it on a basic smartphone?', a: 'Absolutely! The platform is optimized for low-bandwidth connections and works on any smartphone browser.' },
              { q: 'How do payments work?', a: 'Currently, wages are settled directly between farmer and worker. We provide a transparent tracking system. Integrated UPI-based payments are launching in the next quarter.' },
              { q: 'What about IVR and voice features?', a: 'Our IVR system can notify workers about new jobs via automated phone calls. Workers can accept or reject by pressing a key.' },
            ].map((faq, i) => (
              <StaggerItem key={i}>
                <details className="group rounded-xl border border-border bg-card px-5 py-4 shadow-card transition-all hover:shadow-elevated">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </details>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
