/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sun, 
  CloudSun, 
  MapPin, 
  PlusCircle, 
  Radio, 
  Search, 
  Users, 
  FileCheck, 
  BadgeIndianRupee, 
  TrendingUp, 
  Briefcase, 
  Award, 
  CheckCircle, 
  Clock, 
  Star, 
  ChevronRight, 
  ArrowUpRight, 
  UserPlus, 
  ShieldAlert, 
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';
import { Language, User, Job, ActivityLog, WorkerProfile } from '../types';

interface DashboardProps {
  lang: Language;
  t: (key: string) => string;
  user: User;
  onChangeRole: (role: 'farmer' | 'worker' | 'contractor') => void;
  onPostJobClick: () => void;
  onIvrBroadcastClick: () => void;
  onBrowseMarketplaceClick: () => void;
  onUpgradePrompt: () => void;
  activityLogs: ActivityLog[];
  appliedJobIds: string[];
}

export default function Dashboard({ 
  lang, 
  t, 
  user, 
  onChangeRole, 
  onPostJobClick, 
  onIvrBroadcastClick, 
  onBrowseMarketplaceClick, 
  onUpgradePrompt,
  activityLogs,
  appliedJobIds
}: DashboardProps) {

  // Mock weather states
  const weatherIcons: Record<string, string> = {
    'Nashik': '🌤️ 28°C Grape weather',
    'Kolhapur': '🌥️ 30°C High humidity',
    'Pune': '☀️ 32°C Sunny skies',
    'Nagpur': '☀️ 36°C Harvesting alert',
    'Satara': '🌦️ 27°C Gentle spray hint'
  };

  const getDistrictWeather = () => {
    return weatherIcons[user.locationDistrict] || '🌤️ 29°C Warm wind';
  };

  // Mock list of applicant profiles
  const [workers, setWorkers] = useState<WorkerProfile[]>([
    { id: "w-1", name: "Suresh Gaikwad", role: "worker", skills: ["Harvesting", "Pruning"], rating: 4.8, completedJobs: 24, district: user.locationDistrict, phone: "+91 98201 22301", isAvailable: true, dailyRate: 500 },
    { id: "w-2", name: "Arjun Jadhav", role: "worker", skills: ["Grafting", "Plantation"], rating: 4.9, completedJobs: 38, district: user.locationDistrict, phone: "+91 99312 40221", isAvailable: true, dailyRate: 600 },
    { id: "w-3", name: "Sunita Deshmukh", role: "worker", skills: ["Sowing", "Spraying"], rating: 4.7, completedJobs: 15, district: user.locationDistrict, phone: "+91 90212 99011", isAvailable: true, dailyRate: 480 },
    { id: "w-4", name: "Ramesh Pawar", role: "contractor", skills: ["Harvesting", "Loading/Unloading"], rating: 4.6, completedJobs: 54, district: "Pune", phone: "+91 77310 11920", isAvailable: true, dailyRate: 550 }
  ]);

  // Dashboard Toggle state
  const activeRole = user.role;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-fade-in" id="dashboard-tab-panel">
      
      {/* Top Welcome Banner with Role switches & Weather alerts */}
      <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-emerald-950/40 shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-12 bg-primary-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Welcome titles */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {t('welcomeGreeting')}{user.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary-600 text-white animate-pulse">
              {user.isPremium ? 'PRO' : 'BASIC'}
            </span>
          </div>

          <p className="text-sm text-text-secondary flex items-center gap-1.5 font-medium">
            <CloudSun className="w-4 h-4 text-accent-400 shrink-0" />
            <span>{t('weatherCropAlert')} • Current weather in <strong>{user.locationDistrict}</strong>: {getDistrictWeather()}</span>
          </p>
        </div>

        {/* Dashboard role switcher to testing dashboards */}
        <div className="flex flex-col sm:flex-row gap-2 border border-subtle p-1.5 rounded-xl bg-black/40 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onChangeRole('farmer')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 justify-center cursor-pointer ${
              activeRole === 'farmer' ? 'bg-primary-600 text-white shadow' : 'text-text-secondary hover:text-white'
            }`}
          >
            <span>🌾 {t('farmerRole')}</span>
          </button>
          
          <button
            type="button"
            onClick={() => onChangeRole('worker')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 justify-center cursor-pointer ${
              activeRole === 'worker' ? 'bg-primary-600 text-white shadow' : 'text-text-secondary hover:text-white'
            }`}
          >
            <span>👷 {t('workerRole')}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeRole('contractor')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 justify-center cursor-pointer ${
              activeRole === 'contractor' ? 'bg-primary-600 text-white shadow' : 'text-text-secondary hover:text-white'
            }`}
          >
            <span>📋 {t('contractorRole')}</span>
          </button>
        </div>
      </div>

      {/* RENDER FARMER DASHBOARD */}
      {activeRole === 'farmer' && (
        <div className="space-y-8" id="farmer-dashboard-view">
          {/* Quick Action Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="farmer-quick-actions">
            <button
              onClick={onPostJobClick}
              className="relative overflow-hidden group p-5 rounded-2xl glass-card text-left border-primary-500/20 hover:border-primary-500 flex justify-between items-center transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:-translate-y-0.5"
            >
              <div className="space-y-1">
                <span className="text-xl font-bold text-white block">{t('postJobBtn')}</span>
                <span className="text-xs text-text-secondary block">Connect with validated crews</span>
              </div>
              <PlusCircle className="w-8 h-8 text-primary-400 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <button
              onClick={onIvrBroadcastClick}
              className="relative overflow-hidden group p-5 rounded-2xl glass-card text-left border-accent-500/20 hover:border-accent-500 flex justify-between items-center transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:-translate-y-0.5"
            >
              <div className="space-y-1">
                <span className="text-xl font-bold text-white block">{t('launchIvrBtn')}</span>
                <span className="text-xs text-text-secondary block">Broadcast scripts via phone audio</span>
              </div>
              <Radio className="w-8 h-8 text-accent-400 animate-pulse" />
            </button>

            <button
              onClick={onBrowseMarketplaceClick}
              className="relative overflow-hidden group p-5 rounded-2xl glass-card text-left border-emerald-950 hover:border-primary-400 flex justify-between items-center transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <div className="space-y-1">
                <span className="text-xl font-bold text-white block">{t('browseWorkersBtn')}</span>
                <span className="text-xs text-text-secondary block">Browse available local resumes</span>
              </div>
              <Search className="w-8 h-8 text-primary-300" />
            </button>
          </div>

          {/* Core Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="farmer-counters">
            {[
              { label: t('farmerStats1'), val: "4", change: "+1 Today", color: "text-primary-400", sub: "All verified posts", icon: Briefcase },
              { label: t('farmerStats2'), val: "38", change: "+14 This week", color: "text-emerald-400", sub: "96% matched profiles", icon: Users },
              { label: t('farmerStats3'), val: "22,500", change: "Securely escrowed", color: "text-accent-400", sub: "No intermediary cut", icon: BadgeIndianRupee },
              { label: t('farmerStats4'), val: "99.2%", change: "Zero grievances", color: "text-primary-300", sub: "Excellent reputations", icon: FileCheck }
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 border-subtle relative overflow-hidden">
                <div className="absolute top-3 right-3 text-text-muted-theme opacity-30"><stat.icon className="w-6 h-6" /></div>
                <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</div>
                <div className="text-3xl font-black text-white font-mono mt-2 flex items-baseline gap-1">
                  {stat.val === "22,500" ? <span className="text-base font-sans text-text-secondary">₹</span> : null}
                  {stat.val}
                </div>
                <div className="flex justify-between items-center mt-3 text-[11px]">
                  <span className={`font-bold ${stat.color}`}>{stat.change}</span>
                  <span className="text-text-muted-theme">{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row - 2 Column design with custom high fidelity SVG implementations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SVG Line chart container */}
            <div className="glass-card rounded-2xl p-6 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-subtle pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  {t('earningsTrend')}
                </h3>
                <span className="px-2.5 py-1 text-[11px] font-bold bg-primary-950 text-primary-400 rounded-lg">Last 6 Months</span>
              </div>

              {/* Handcrafted high fidelity interactive SVG Line Chart */}
              <div className="w-full h-64 relative bg-[#060a08]/40 rounded-xl border border-subtle/50 p-4 shrink-0 flex flex-col justify-between">
                <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="500" y2="10" stroke="#12241c" strokeDasharray="3" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#12241c" strokeDasharray="3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#12241c" strokeDasharray="3" />

                  {/* Gradient Area definition */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area */}
                  <path d="M 0 90 L 0 75 Q 100 85 100 55 T 200 45 T 300 15 T 400 35 T 500 20 L 500 90 Z" fill="url(#chartGlow)" />

                  {/* Master Stroke Curve Line */}
                  <path d="M 0 75 Q 100 85 100 55 T 200 45 T 300 15 T 400 35 T 500 20" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                  {/* Hotspots pointer circles */}
                  <circle cx="100" cy="55" r="4.5" fill="#f59e0b" stroke="#040806" strokeWidth="1.5" />
                  <circle cx="300" cy="15" r="4.5" fill="#34d399" stroke="#040806" strokeWidth="1.5" />
                  <circle cx="500" cy="20" r="4.5" fill="#10b981" stroke="#040806" strokeWidth="1.5" />
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[11px] font-mono text-text-muted-theme border-t border-subtle/30 pt-2 shrink-0">
                  <span>Dec</span>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar (Harvest)</span>
                  <span>Apr</span>
                  <span>Current (May)</span>
                </div>
              </div>
            </div>

            {/* SVG Pie Chart / Labor skill distribution */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-subtle pb-3">
                {t('distributionSkills')}
              </h3>

              <div className="flex flex-col items-center justify-center p-4 space-y-6">
                {/* SVG Donut */}
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full rotate-[-90deg]">
                    {/* Circle 1 - Base full */}
                    <circle cx="72" cy="72" r="50" fill="transparent" stroke="#12241c" strokeWidth="16" />
                    {/* Circle 2 - Segment 55% harvesting */}
                    <circle cx="72" cy="72" r="50" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="314" strokeDashoffset="125" />
                    {/* Circle 3 - Segment 25% plantation */}
                    <circle cx="72" cy="72" r="50" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="314" strokeDashoffset="260" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-white font-mono">142</span>
                    <span className="text-[9px] text-text-secondary uppercase">Local Crew Resumes</span>
                  </div>
                </div>

                {/* Labels legend */}
                <div className="space-y-2 w-full text-xs">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                      Harvesting Team
                    </span>
                    <span className="font-mono text-text-secondary">55%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />
                      Grafting & Plantation
                    </span>
                    <span className="font-mono text-text-secondary">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-semibold text-text-primary">
                      <span className="w-2.5 h-2.5 rounded-full bg-earth-500" />
                      Irrigation Setup
                    </span>
                    <span className="font-mono text-text-secondary">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Row: Recent Activities timeline vs Local verified proposed list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Timeline */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-subtle pb-3">
                Job Actions Chronology Log
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-subtle">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 items-start relative group">
                      <div className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center shrink-0 z-10 border border-primary-500/30 text-xs">
                        🌱
                      </div>
                      <div className="flex-1 space-y-1 bg-black/10 p-3.5 rounded-xl border border-subtle/50">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{log.title}</span>
                          <span className="text-[10px] font-mono text-text-muted-theme">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-text-secondary">{log.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-text-muted-theme text-xs">
                    No timeline actions logged yet in current session. Try posting or applying!
                  </div>
                )}
              </div>
            </div>

            {/* Local Workers Enlisted list */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-subtle pb-3">
                {t('recentProposals')}
              </h3>

              <div className="divide-y divide-subtle">
                {workers.map((work) => (
                  <div key={work.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center font-bold text-xs text-white">
                        {work.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-primary-300 transition-colors">{work.name}</div>
                        <div className="flex gap-1.5 mt-1">
                          {work.skills.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-[9px] bg-black/40 text-emerald-400 font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-white font-mono">₹{work.dailyRate}/day</div>
                      <div className="text-[10px] text-accent-400 text-right font-bold inline-flex items-center gap-0.5 justify-end">
                        <Star className="w-2.5 h-2.5 fill-accent-400 text-accent-400" />
                        {work.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* RENDER WORKER DASHBOARD */}
      {activeRole === 'worker' && (
        <div className="space-y-8" id="worker-dashboard-view">
          
          {/* Worker Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { label: t('workerStats1'), val: "22", change: "Verified clean history", color: "text-primary-400", sub: "Grapes, cane cut", icon: CheckCircle },
              { label: t('workerStats2'), val: appliedJobIds.length.toString(), change: "Currently applied to", color: "text-emerald-400", sub: "Farmers notified", icon: Clock },
              { label: t('workerStats3'), val: "42,800", change: "Safe Direct Payouts", color: "text-accent-400", sub: "All accounts clear", icon: BadgeIndianRupee },
              { label: t('workerStats4'), val: "4.95 ⭐", change: "Top Tier Worker badge", color: "text-warning", sub: "100% attendance rate", icon: Star }
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 border-subtle relative overflow-hidden" id="worker-stat-counters">
                <div className="absolute top-3 right-3 text-text-muted-theme opacity-30"><stat.icon className="w-5 h-5" /></div>
                <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</div>
                <div className="text-3xl font-black text-white font-mono mt-2">{stat.val}</div>
                <div className="flex justify-between items-center mt-3 text-[11px]">
                  <span className={`font-bold ${stat.color}`}>{stat.change}</span>
                  <span className="text-text-muted-theme">{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Target suggestions progress */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Recommended Jobs */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-subtle pb-3">
                  🔥 Personalized Crop Job Recommendations for you ({user.locationDistrict})
                </h3>

                <div className="space-y-4">
                  {[
                    { title: "Standard Groundnut Crop Picking Operations", farm: "Vikas Dhoble Farms", skills: ["Harvesting"], rate: 580, dist: "12 km nearby", match: 96 },
                    { title: "Manual Sugar-stick loading supervisor", farm: "Koyna Sugar Contractor", skills: ["Loading/Unloading"], rate: 600, dist: "18 km nearby", match: 91 }
                  ].map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl border border-subtle bg-black/10 flex items-center justify-between justify-items-center gap-4 group hover:border-primary-500/30 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-primary-300 transition-colors">{rec.title}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] bg-primary-600 text-white font-black font-sans">{rec.match}% Match</span>
                        </div>
                        <div className="flex gap-2 text-xs text-text-secondary">
                          <span>{rec.farm}</span>
                          <span>•</span>
                          <span className="text-primary-400">{rec.dist}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-white font-mono">₹{rec.rate}/day</div>
                        <button 
                          onClick={onBrowseMarketplaceClick}
                          className="mt-1 text-xs text-accent-400 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          View Open <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: certified agricultural badges progress */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-subtle pb-3">
                  Verified Skills Badges
                </h3>

                <div className="space-y-4">
                  {[
                    { skill: "Harvesting & Sowing", pct: 100, status: "Master Certified ✅" },
                    { skill: "Drip Irrigation Setup", pct: 75, status: "Advanced Technical Training" },
                    { skill: "Precision Pesticide Spraying", pct: 40, status: "Beginner Practitioner" }
                  ].map((skl, idx) => (
                    <div key={idx} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center font-semibold text-text-primary">
                        <span>{skl.skill}</span>
                        <span className="text-primary-400 font-bold">{skl.pct}%</span>
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${skl.pct}%` }} />
                      </div>
                      <div className="text-[10px] text-text-muted-theme text-right">{skl.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure verification notification details */}
              <div className="p-4 rounded-xl bg-accent-950/20 border border-accent-900/30 text-xs text-text-secondary leading-relaxed">
                🛡️ <strong>Verify Your Identity:</strong> Increase matching proposals by link connecting with local tehsil supervisors. Government ID checks are completed for free.
              </div>
            </div>
          </div>
        </div>
      )}


      {/* RENDER CONTRACTOR DASHBOARD */}
      {activeRole === 'contractor' && (
        <div className="space-y-8" id="contractor-dashboard-view">
          
          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 border-subtle">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('crewTotal')}</div>
              <div className="text-3xl font-black text-white font-mono mt-2">68 Workers</div>
              <div className="text-xs text-primary-400 font-bold mt-2">✓ All identity cleared</div>
            </div>

            <div className="glass-card rounded-2xl p-6 border-subtle">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('activeProjects')}</div>
              <div className="text-3xl font-black text-white font-mono mt-2">4 Active Farms</div>
              <div className="text-xs text-accent-400 font-bold mt-2">📊 sugarcane and onion plots</div>
            </div>

            <div className="glass-card rounded-2xl p-6 border-subtle">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Operational Funds managed</div>
              <div className="text-3xl font-black text-white font-mono mt-2">₹1,84,500</div>
              <div className="text-xs text-emerald-400 font-bold mt-2">✓ Safely escrowed under supervisor</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Active crew listing */}
            <div className="lg:col-span-8 space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-subtle pb-3">
                  Supervised active Labor subdivisions
                </h3>

                <div className="space-y-4">
                  {[
                    { lead: "Bapurao Shinde", count: 24, crop: "Sugarcane cutting", efficiency: 98 },
                    { lead: "Satish Kadam", count: 18, crop: "Onion Plantation", efficiency: 94 },
                    { lead: "Savitri Shinde", count: 12, crop: "Vine grafting", efficiency: 100 }
                  ].map((team, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-subtle bg-black/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="text-sm font-bold text-white">Lead: {team.lead}</div>
                        <p className="text-xs text-text-secondary">Harvesting Operation: <strong>{team.crop}</strong></p>
                      </div>

                      <div className="flex gap-6 items-center text-xs">
                        <div>
                          <div className="text-[10px] text-text-muted-theme uppercase">Crew size</div>
                          <span className="font-mono font-bold text-white text-sm">{team.count} members</span>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-muted-theme uppercase">Efficiency Metric</div>
                          <span className="font-mono font-extrabold text-[#22c55e] text-sm">{team.efficiency}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shift timings / planner */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-subtle pb-3">
                  Sub-contracts Timeline Planner
                </h3>

                <div className="space-y-4 text-xs font-medium">
                  {[
                    { month: "May 2026", task: "Niphad Grape Orchard post-care", days: "Finished ✅" },
                    { month: "June 2026", task: "Baramati sugarcane clearing", days: "Starts in 4 days ⏳" },
                    { month: "July 2026", task: "Pune vegetable plantation prep", days: "Scheduled 🗓️" }
                  ].map((plan, idx) => (
                    <div key={idx} className="flex gap-3 justify-between items-center p-2.5 rounded bg-black/40 border border-subtle">
                      <div>
                        <div className="font-mono text-accent-400 font-bold">{plan.month}</div>
                        <div className="text-text-primary mt-1">{plan.task}</div>
                      </div>
                      <span className="text-[10px] bg-primary-950 text-primary-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                        {plan.days}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
