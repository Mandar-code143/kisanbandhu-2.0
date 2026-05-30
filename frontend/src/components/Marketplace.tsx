/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Coins, 
  Calendar, 
  Briefcase, 
  User, 
  Star, 
  SlidersHorizontal, 
  ChevronRight, 
  CheckCircle, 
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Send,
  XCircle
} from 'lucide-react';
import { Language, Job } from '../types';

interface MarketplaceProps {
  lang: Language;
  t: (key: string) => string;
  appliedJobIds: string[];
  onApplyJob: (jobId: string) => void;
  onActivityLog: (type: 'job_posted' | 'application_received' | 'job_accepted' | 'payment_processed' | 'ivr_launched', title: string, desc: string) => void;
}

export default function Marketplace({ lang, t, appliedJobIds, onApplyJob, onActivityLog }: MarketplaceProps) {
  // Setup client metrics & mocks
  const initialJobs: Job[] = [
    {
      id: "job-001",
      title: "Grape Vineyard Grafting Specialist Team Needed",
      category: "Grafting",
      location: "Pimpalgaon, Niphad",
      district: "Nashik",
      postedDate: "2026-05-28",
      wage: 650,
      wageType: 'day',
      skills: ["Grafting", "Vine pruning", "Harvesting"],
      farmerName: "Rajesh Patil",
      farmerRating: 4.8,
      applicantsCount: 14,
      description: "Looking for skilled grape grafting team members. 250 vines per worker daily. Safe transport from Pipmpalgaon bus stand provided. Lunch, tea and snacks served twice in vineyard.",
      duration: "10 Days",
      requiredWorkers: 15,
      matchPercentage: 96
    },
    {
      id: "job-002",
      title: "Sugarcane Harvesting & Loading Crews",
      category: "Harvesting",
      location: "Shirol Block, Hatkanangle",
      district: "Kolhapur",
      postedDate: "2026-05-27",
      wage: 550,
      wageType: 'day',
      skills: ["Harvesting", "Loading/Unloading", "Sugarcane cutting"],
      farmerName: "Maruti Deshmukh",
      farmerRating: 4.9,
      applicantsCount: 38,
      description: "Urgent recruitment for Sugarcane cutting crews. Daily wages paid in cash directly with transit supervisor. Standard contracts with protective safety boots provided.",
      duration: "20 Days",
      requiredWorkers: 40,
      matchPercentage: 92
    },
    {
      id: "job-003",
      title: "Onion Plantation Sowing Handlers",
      category: "Plantation",
      location: "Lasalgaon Mandi",
      district: "Nashik",
      postedDate: "2026-05-26",
      wage: 480,
      wageType: 'day',
      skills: ["Plantation", "Sowing", "Lasalgaon soil prep"],
      farmerName: "Sanjay Sanap",
      farmerRating: 4.6,
      applicantsCount: 9,
      description: "Lasalgaon premium seed onion sowing. Field has drop drip lines ready. Standard daily shift hours (8 AM - 5 PM) with guaranteed tea breaks.",
      duration: "5 Days",
      requiredWorkers: 8,
      matchPercentage: 88
    },
    {
      id: "job-004",
      title: "Drip Irrigation Setup Technicians",
      category: "Irrigation",
      location: "Baramati Block",
      district: "Pune",
      postedDate: "2026-05-25",
      wage: 700,
      wageType: 'day',
      skills: ["Irrigation", "Pipes layout", "Plumbing"],
      farmerName: "Amol Shinde",
      farmerRating: 4.7,
      applicantsCount: 6,
      description: "Laying inline lateral drip pipes for 4 acres of banana orchards. Technical drawing reference provided. Experience with Netafim or Jain Irrigation systems preferred.",
      duration: "4 Days",
      requiredWorkers: 3,
      matchPercentage: 94
    },
    {
      id: "job-005",
      title: "Organic Fertilizer & Pomegranate Pesticides Spraying",
      category: "Spraying",
      location: "Sangola",
      district: "Satara",
      postedDate: "2026-05-24",
      wage: 620,
      wageType: 'day',
      skills: ["Pesticide Application", "Organic compost", "Spraying"],
      farmerName: "Vikas Dhoble",
      farmerRating: 4.5,
      applicantsCount: 3,
      description: "Spraying organic seaweed extract compost on pomegranate plantation. Full knapsack pump provided. Protective gloves and mask mandatory.",
      duration: "3 Days",
      requiredWorkers: 5,
      matchPercentage: 85
    }
  ];

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [maxWage, setMaxWage] = useState(800);
  const [sortBy, setSortBy] = useState<'wage-desc' | 'wage-asc' | 'date' | 'match'>('match');

  // Job Details Dialog / Modal
  const [selectedJobDetails, setSelectedJobDetails] = useState<Job | null>(null);

  // Categories list
  const categories = useMemo(() => ['All', 'Harvesting', 'Plantation', 'Grafting', 'Irrigation', 'Spraying'], []);
  const districts = useMemo(() => ['All', 'Nashik', 'Kolhapur', 'Pune', 'Satara'], []);

  // Filter jobs dynamically
  const filteredJobs = useMemo(() => {
    return initialJobs
      .filter((job) => {
        // Search
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          job.title.toLowerCase().includes(query) || 
          job.skills.some(s => s.toLowerCase().includes(query)) ||
          job.farmerName.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query);

        // Category
        const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;

        // District
        const matchesDistrict = selectedDistrict === 'All' || job.district === selectedDistrict;

        // Max wage
        const matchesWage = job.wage <= maxWage;

        return matchesQuery && matchesCategory && matchesDistrict && matchesWage;
      })
      .sort((a, b) => {
        if (sortBy === 'wage-desc') return b.wage - a.wage;
        if (sortBy === 'wage-asc') return a.wage - b.wage;
        if (sortBy === 'date') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      });
  }, [searchQuery, selectedCategory, selectedDistrict, maxWage, sortBy]);

  // Apply Action controller
  const handleApplyNow = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    if (appliedJobIds.includes(job.id)) return;
    onApplyJob(job.id);
    onActivityLog(
      'application_received',
      `Applied to: ${job.title}`,
      `Your verified credentials have been transmitted to Farmer ${job.farmerName}.`
    );
  };

  // Crop illustrations themes matching categories
  const getBannerGradient = (cat: string) => {
    switch (cat) {
      case 'Harvesting':
        return 'from-amber-600/30 to-amber-950/40 border-amber-500/20'; // Golden wheat
      case 'Plantation':
        return 'from-emerald-600/30 to-emerald-950/40 border-emerald-500/20'; // Fresh sprout
      case 'Grafting':
        return 'from-purple-600/30 to-purple-950/40 border-purple-500/20'; // Grapes Niphad purple
      case 'Irrigation':
        return 'from-blue-600/30 to-blue-950/40 border-blue-500/20'; // Water droplet
      default:
        return 'from-primary-600/30 to-primary-950/40 border-primary-500/20'; // Earth generic
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in" id="marketplace-page">
      {/* Header section with Stats header card */}
      <div className="text-center mb-10">
        <motion.span 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-400 bg-primary-500/10 border border-primary-500/20 mb-3"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t('browseActiveJobs')}
        </motion.span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
          Agricultural Job Marketplace
        </h1>
        <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
          Eradicate the broker commission margins. Secure higher direct seasonal daily wage rates with transparent contract details.
        </p>
      </div>

      {/* Sticky and unified Filters Station bar */}
      <div className="glass-card rounded-2xl p-6 mb-8 sticky top-20 z-40 space-y-4 border-emerald-950 shadow-xl" id="sticky-filter-bar">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Bar Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted-theme w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none text-sm placeholder-text-muted-theme font-medium"
              placeholder={t('searchPlaceholder')}
            />
          </div>

          {/* District Select option drop */}
          <div className="md:col-span-3 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400 w-4 h-4" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none text-sm font-medium appearance-none"
            >
              <option value="All">District: All Location</option>
              {districts.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>District: {d}</option>
              ))}
            </select>
          </div>

          {/* Sort Controller bar */}
          <div className="md:col-span-2 relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-400 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-11 pl-10 pr-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none text-sm font-medium appearance-none"
            >
              <option value="match">{t('matchingPercentage')} 🔥</option>
              <option value="wage-desc">Wage: High to Low</option>
              <option value="wage-asc">Wage: Low to High</option>
              <option value="date">Date: Newest</option>
            </select>
          </div>

          {/* Wage Slider Range station */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-text-secondary uppercase">
              <span>Max Wage:</span>
              <span className="font-mono text-primary-400">₹{maxWage}/Day</span>
            </div>
            <input
              type="range"
              min="400"
              max="1000"
              step="50"
              value={maxWage}
              onChange={(e) => setMaxWage(Number(e.target.value))}
              className="w-full h-1 bg-subtle rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
        </div>

        {/* Horizontal Scroll Categories selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 invisible-scrollbar">
          <SlidersHorizontal className="w-4 h-4 text-text-muted-theme shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border duration-300 ${
                selectedCategory === cat 
                  ? 'bg-primary-600 text-white border-primary-500' 
                  : 'bg-black/20 text-text-secondary border-subtle hover:bg-black/40'
              }`}
            >
              {cat === 'All' ? t('all') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          id="jobs-listing-grid"
        >
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job.id);
              return (
                <motion.div
                  layout
                  key={job.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedJobDetails(job)}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group hover:border-primary-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all duration-300 relative min-h-[380px]"
                >
                  {/* Top Illustrated Card Header Banner with Crop aesthetics */}
                  <div className={`h-28 bg-gradient-to-br ${getBannerGradient(job.category)} p-4 flex flex-col justify-between border-b relative overflow-hidden shrink-0`}>
                    <div className="absolute top-0 right-0 p-8 w-24 h-24 bg-white/2 rounded-full blur-xl pointer-events-none" />
                    
                    {/* Badge details */}
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/50 text-emerald-400 border border-emerald-500/20 rounded-full">
                        {job.category}
                      </span>
                      {job.matchPercentage && (
                        <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-emerald-500 text-white border border-emerald-400/30 rounded-full font-black tracking-wide shadow-md">
                          <Sparkles className="w-3 h-3 text-accent-300 fill-accent-300 animate-pulse" />
                          <span>{job.matchPercentage}% MATCH</span>
                        </div>
                      )}
                    </div>

                    {/* Geocommunity Pin location */}
                    <div className="flex items-center text-xs text-white font-semibold drop-shadow-md">
                      <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0 mr-1" />
                      <span>{job.location}, {job.district}</span>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors line-clamp-2 leading-snug">
                        {job.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Worker pills requirements */}
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map(sk => (
                        <span key={sk} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-900/10 text-emerald-300 border border-emerald-950/20 font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Wage indicator */}
                    <div className="flex items-baseline justify-between border-t border-subtle pt-3.5 mt-auto">
                      <div>
                        <div className="text-[10px] text-text-muted-theme uppercase tracking-wider font-semibold">Seasonal Wage</div>
                        <div className="text-xl font-black text-primary-400 font-mono">
                          ₹{job.wage} <span className="text-xs text-text-secondary font-sans font-normal">/{job.wageType}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-text-muted-theme uppercase tracking-wider font-semibold">Target duration</div>
                        <p className="text-xs font-bold text-white font-mono">{job.duration}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar bottom */}
                  <div className="px-5 py-4 bg-black/25 grid grid-cols-12 gap-2 items-center border-t border-subtle">
                    {/* Farmer summary */}
                    <div className="col-span-6 flex gap-2 items-center text-xs">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-700 to-accent-600 flex items-center justify-center font-bold text-[9px] text-white uppercase shadow-inner">
                        {job.farmerName.slice(0, 2)}
                      </div>
                      <div className="truncate">
                        <div className="text-white font-bold truncate leading-tight">{job.farmerName}</div>
                        <div className="text-[9px] text-accent-400 flex items-center gap-0.5 font-bold">
                          <Star className="w-2.5 h-2.5 fill-accent-400 text-accent-400" />
                          {job.farmerRating}
                        </div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={(e) => handleApplyNow(job, e)}
                      className={`col-span-6 h-9 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 ${
                        isApplied 
                          ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 pointer-events-none' 
                          : 'bg-primary-600 hover:bg-primary-500 text-white hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t('appliedBtn')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('applyNowBtn')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center space-y-4">
              <Briefcase className="w-16 h-16 text-text-muted-theme mx-auto animate-pulse" />
              <div>
                <h4 className="text-xl font-bold text-white">No Jobs Found Matching Criteria</h4>
                <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1">
                  Try broadening your wage limit ranges or selecting 'All Crops Operations' category filters.
                </p>
              </div>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDistrict('All');
                  setMaxWage(1000);
                }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Detailed Modal Drawer */}
      {selectedJobDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl relative border-emerald-900"
          >
            {/* Header info banner in detailed view */}
            <div className={`h-36 bg-gradient-to-r ${getBannerGradient(selectedJobDetails.category)} p-6 flex flex-col justify-between relative border-b`}>
              <button 
                onClick={() => setSelectedJobDetails(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white/80 hover:text-white hover:bg-black/60 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <span className="px-3 py-1 text-xs font-black uppercase bg-black/50 text-emerald-400 border border-emerald-500/20 rounded-full w-max">
                {selectedJobDetails.category}
              </span>

              <div className="flex items-center gap-1 text-white font-bold text-sm drop-shadow-md">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>{selectedJobDetails.location}, {selectedJobDetails.district} (MH)</span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white leading-snug">
                  {selectedJobDetails.title}
                </h2>
                <div className="text-xs text-text-muted-theme font-mono mt-1">
                  Posted Date: {selectedJobDetails.postedDate} • Applied count: {selectedJobDetails.applicantsCount} workers
                </div>
              </div>

              {/* Stats overview boxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-black/20 rounded-xl border border-subtle">
                  <div className="text-[10px] text-text-secondary uppercase">Offered Wage</div>
                  <div className="text-base font-black text-primary-400 font-mono">₹{selectedJobDetails.wage} /day</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-subtle">
                  <div className="text-[10px] text-text-secondary uppercase">Estimated Period</div>
                  <div className="text-base font-black text-white font-mono">{selectedJobDetails.duration}</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-subtle">
                  <div className="text-[10px] text-text-secondary uppercase">Positions</div>
                  <div className="text-base font-black text-white font-mono">{selectedJobDetails.requiredWorkers} openings</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-subtle">
                  <div className="text-[10px] text-text-secondary uppercase">Match Rating</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">High ({selectedJobDetails.matchPercentage}%)</div>
                </div>
              </div>

              {/* Long description text */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-primary-400" />
                  Description & Benefits Provided:
                </h4>
                <p className="text-sm text-text-primary leading-relaxed bg-black/10 p-4 rounded-xl border border-subtle">
                  {selectedJobDetails.description}
                </p>
              </div>

              {/* Required Skills list */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJobDetails.skills.map(sk => (
                    <span key={sk} className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Farmer and escrow info row */}
              <div className="p-4 rounded-xl bg-primary-950/20 border border-primary-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold text-sm text-primary-400 border border-primary-500/40">
                    {selectedJobDetails.farmerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{selectedJobDetails.farmerName}</div>
                    <div className="text-xs text-accent-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-accent-400 text-accent-400 animate-spin-none" />
                      <span>{selectedJobDetails.farmerRating} out of 5 stars • Fast payer</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-text-secondary max-w-xs md:text-right">
                  🔒 <strong>Wages Protected:</strong> Funds for this job are escrow-registered under the AI standard system.
                </div>
              </div>
            </div>

            {/* Bottom Actions card */}
            <div className="p-6 bg-black/40 border-t border-subtle flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-xs text-text-muted-theme font-mono">
                By pressing apply, we submit your verified phone ID & work rating.
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedJobDetails(null)}
                  className="h-11 px-6 rounded-xl border border-subtle text-white text-xs font-bold hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    handleApplyNow(selectedJobDetails, e);
                    setSelectedJobDetails(null);
                  }}
                  className={`h-11 px-8 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 flex-grow md:flex-grow-0 cursor-pointer ${
                    appliedJobIds.includes(selectedJobDetails.id)
                      ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 pointer-events-none'
                      : 'bg-primary-600 hover:bg-primary-500 text-white shadow-xl'
                  }`}
                >
                  {appliedJobIds.includes(selectedJobDetails.id) ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t('appliedBtn')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply Instantly</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
