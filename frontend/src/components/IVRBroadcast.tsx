/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PhoneCall, 
  Volume2, 
  Users, 
  MapPin, 
  Clock, 
  Calendar, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Coins, 
  AlertCircle, 
  Loader2, 
  Play, 
  Square,
  HelpCircle
} from 'lucide-react';
import { Language, IVRCampaign } from '../types';

interface IVRBroadcastProps {
  lang: Language;
  t: (key: string) => string;
  isPremium: boolean;
  onUpgradePrompt: () => void;
  onActivityLog: (type: 'job_posted' | 'application_received' | 'job_accepted' | 'payment_processed' | 'ivr_launched', title: string, desc: string) => void;
}

export default function IVRBroadcast({ lang, t, isPremium, onUpgradePrompt, onActivityLog }: IVRBroadcastProps) {
  // Setup standard state
  const [campaignTitle, setCampaignTitle] = useState('Sugarcane Harvest Team Nashik');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Harvesting', 'Loading/Unloading']);
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [selectedScriptLang, setSelectedScriptLang] = useState<Language>(lang);
  const [startDate, setStartDate] = useState('2026-06-02');
  const [startTime, setStartTime] = useState('09:30');
  const [shiftDuration, setShiftDuration] = useState('15 Days');
  const [customWageText, setCustomWageText] = useState('550');

  // Interactive Incoming Call Simulation
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'active' | 'hangup'>('idle');
  const [audioProgress, setAudioProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Modal Launcher State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Mock list of campaigns
  const [campaigns, setCampaigns] = useState<IVRCampaign[]>([
    {
      id: "ivr-101",
      title: "Grapes Grafting Emergency Team",
      targetSkills: ["Grafting", "Plantation"],
      district: "Nashik",
      messageScript: {
        en: "Attention agricultural workers: Urgent requirement for grafting team in Nashik. Daily wage 600 Rupees with food provided. Press 1 to accept.",
        hi: "ध्यान दें कृषि भाइयों: नासिक में ग्राफ्टिंग टीम की तत्काल आवश्यकता है। दैनिक वेतन ₹600 भोजन के साथ। स्वीकार करने के लिए 1 दबाएं।",
        mr: "कृपया लक्ष द्या: नाशिकमध्ये द्राक्ष कलमीकरणासाठी मजुरांची त्वरित गरज आहे. रोज ६०० रुपये मानधन अधिक जेवण मिळेल. होकार देण्यासाठी १ दाबा."
      },
      scheduledDate: "2026-05-24",
      scheduledTime: "10:00",
      workersCount: 4200,
      status: "completed",
      estimatedCost: 1260
    },
    {
      id: "ivr-102",
      title: "Cotton Picking Seasonal Call",
      targetSkills: ["Harvesting"],
      district: "Nagpur",
      messageScript: {
        en: "Seasons greetings. Cotton plantation owner in Nagpur is seeking 20 workers for cotton picking operations. Pay is 400 Rupees per day. Dial 1.",
        hi: "नमस्कार। नागपुर में कपास उत्पादक किसान को कपास तोडने के लिए 20 श्रमिकों की आवश्यकता है। वेतन ₹400 प्रतिदिन। डायल करें 1।",
        mr: "नमस्कार. नागपूर येथील कापूस उत्पादक शेतकऱ्याला कापूस वेचणीसाठी २० मजुरांची आवश्यकता आहे. रोज ४०० रुपये मळतील. होकारासाठी १ दाबा."
      },
      scheduledDate: "2026-06-01",
      scheduledTime: "08:00",
      workersCount: 8500,
      status: "scheduled",
      estimatedCost: 2550
    }
  ]);

  // Handle skill checkboxes
  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Generate real-time preview script based on variables
  const generateScript = (l: Language) => {
    const listStr = selectedSkills.length > 0 ? selectedSkills.join(' & ') : 'General Crop Handling';
    if (l === 'en') {
      return `[System Operator Broadcast Alert]\n"This is Krushi Rojgar Sandhi. Farmer Rajesh Patil has an urgent job opening for '${listStr}' operations in ${selectedDistrict} for a duration of ${shiftDuration}. Daily wage offered is ₹${customWageText} with secure travel. To accept this job immediately and share your verified ID directly with the farmer, press 1 now. To reject, press 9."`;
    } else if (l === 'hi') {
      return `[स्वचालित कृषि प्रणाली प्रसारण अलर्ट]\n"यह कृषि रोजगार संधि की तरफ से कॉल है। किसान राजेश पाटिल के पास ${selectedDistrict} जिला में '${listStr}' हेतु ${shiftDuration} की अवधि के लिए आवश्यक रिक्तियां हैं। सुरक्षित यात्रा सुविधा के साथ प्रस्तावित दैनिक वेतन ₹${customWageText} है। काम स्वीकार करने और अपनी आईडी किसान के साथ सुरक्षित साझा करने के लिए कृपया अभी 1 दबाएं। अस्वीकार करने के लिए 9 दबाएं।"`;
    } else {
      return `[स्वयंचलित कृषी प्रणाली प्रसारण संदेश]\n"कृषी रोजगार संधीकडून आपणासाठी संदेश आला आहे. शेतकरी राजेश पाटील यांच्या शेतावर ${selectedDistrict} जिल्ह्यामध्ये '${listStr}' कामासाठी पुढील ${shiftDuration} कालावधीकरिता त्वरित मजुरांची गरज आहे. रोजचे मानधन ₹${customWageText} अधिक मोफत बैलगाडी/प्रवास सेवा मिळेल. काम स्वीकारण्यासाठी आणि आपली माहिती थेट शेतकऱ्याला पाठवण्यासाठी कृपया लगेच १ दाबा. नाकारण्यासाठी ९ दाबा."`;
    }
  };

  // Cost estimates
  const calculatedNumContacts = selectedSkills.length * 4200 + (selectedDistrict === 'Nashik' ? 2500 : 1200);
  const costPerContact = 0.35; // Rs 0.35 per worker
  const estimatedCost = Math.round(calculatedNumContacts * costPerContact);

  // Simulate Caller Screen Timer Progress
  useEffect(() => {
    let interval: any;
    if (callState === 'active') {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setCallState('hangup');
            setIsSimulatingCall(false);
            return 0;
          }
          return prev + 4;
        });
      }, 500);
    } else {
      setAudioProgress(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Audio simulator triggered
  const startSimulation = () => {
    setIsSimulatingCall(true);
    setCallState('calling');
  };

  const endSimulation = () => {
    setIsSimulatingCall(false);
    setCallState('idle');
  };

  // Launching function
  const handleLaunchCampaign = () => {
    if (!isPremium) {
      onUpgradePrompt();
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const confirmCampaign = () => {
    setIsLaunching(true);
    setTimeout(() => {
      const newC: IVRCampaign = {
        id: `ivr-${Date.now()}`,
        title: campaignTitle || "Quick Micro Voice Blast",
        targetSkills: selectedSkills,
        district: selectedDistrict,
        messageScript: {
          en: generateScript('en'),
          hi: generateScript('hi'),
          mr: generateScript('mr'),
        },
        scheduledDate: startDate,
        scheduledTime: startTime,
        workersCount: calculatedNumContacts,
        status: 'scheduled',
        estimatedCost: estimatedCost
      };

      setCampaigns([newC, ...campaigns]);
      setIsLaunching(false);
      setIsConfirmModalOpen(false);

      // Trigger standard callback alert & Logs
      onActivityLog(
        'ivr_launched',
        `Broadcast Started: ${campaignTitle}`,
        `VoIP call scheduled to reach ${calculatedNumContacts} laborers in ${selectedDistrict}.`
      );

      alert(t('successNotification'));
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" id="ivr-campaign-page">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-accent-400 bg-accent-500/10 border border-accent-500/20 mb-3"
        >
          {t('featuresOverline')}
        </motion.span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4" id="ivr-main-title">
          {t('ivrTitle')}
        </h1>
        <p className="text-sm md:text-lg text-emerald-100/70 max-w-3xl mx-auto" id="ivr-main-desc">
          {t('ivrSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Left - spans 7 cols */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-subtle pb-4">
              <Sliders className="w-5 h-5 text-primary-400" />
              Campaign Configuration
            </h3>

            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Campaign Title / Farm Objective
              </label>
              <input 
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                placeholder="e.g. Sugarcane Harvesting Team Kolhapur"
              />
            </div>

            {/* Step 1: Target Audience Skills */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex justify-between">
                <span>{t('audienceLabel')}</span>
                <span className="text-accent-400 text-[11px] normal-case">Select multiple skills</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Harvesting', 'Plantation', 'Grafting', 'Irrigation', 'Loading/Unloading', 'Pesticide Application'].map((skill) => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all duration-300 ${
                        isChecked 
                          ? 'border-primary-500/50 bg-primary-500/10 text-white' 
                          : 'border-subtle bg-black/20 text-text-secondary hover:border-text-muted-theme'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        className="accent-primary-500 pointer-events-none" 
                      />
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Location and Wage Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t('stateSelect')}
                </label>
                <select className="w-full h-12 px-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none">
                  <option value="MH">Maharashtra</option>
                  <option value="UP">Uttar Pradesh</option>
                  <option value="KA">Karnataka</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t('districtSelect')}
                </label>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none"
                >
                  <option value="Nashik">Nashik (नाशिक)</option>
                  <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                  <option value="Pune">Pune (पुणे)</option>
                  <option value="Nagpur">Nagpur (नागपूर)</option>
                  <option value="Satara">Satara (सातारा)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Offered Wage (₹/Day)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 font-bold">₹</span>
                  <input 
                    type="number"
                    value={customWageText}
                    onChange={(e) => setCustomWageText(e.target.value)}
                    className="w-full h-12 pl-8 pr-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none font-mono"
                    placeholder="500"
                  />
                </div>
              </div>
            </div>

            {/* Language Selection Tab preview */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  {t('msgScriptLabel')}
                </label>
                <div className="flex gap-1.5 p-1 rounded-lg bg-black/40 border border-subtle" id="script-lang-tabs">
                  <button 
                    type="button"
                    onClick={() => setSelectedScriptLang('mr')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      selectedScriptLang === 'mr' ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    मराठी
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedScriptLang('hi')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      selectedScriptLang === 'hi' ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedScriptLang('en')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      selectedScriptLang === 'en' ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Styled output Script code-console block */}
              <div className="relative rounded-xl overflow-hidden border border-emerald-950 bg-[#060a08] p-5 font-mono text-sm leading-relaxed text-emerald-400">
                <div className="absolute right-3 top-3 flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
                </div>
                <div className="text-xs text-text-muted transition-colors mb-2">// TELECOM DIALOUT DIGITAL WAVEFORM SCRIPT</div>
                <div className="text-text-primary">
                  {generateScript(selectedScriptLang)}
                </div>
              </div>
            </div>

            {/* Time scheduler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-subtle pt-6">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-accent-400" />
                  {t('scheduleCallDate')}
                </label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent-400" />
                  {t('scheduleCallTime')}
                </label>
                <input 
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Est. Shift Duration
                </label>
                <select 
                  value={shiftDuration}
                  onChange={(e) => setShiftDuration(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl text-white bg-black/40 border border-subtle focus:border-primary-500 transition-all outline-none"
                >
                  <option value="3 Days">3 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="10 Days">10 Days</option>
                  <option value="15 Days">15 Days</option>
                  <option value="1 Month">1 Month</option>
                </select>
              </div>
            </div>

            {/* Estimated Reach Stat Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-primary-950/20 border border-primary-900/30">
              <div className="flex gap-4 items-center">
                <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{t('estimateWorkers')}</div>
                  <div className="text-2xl font-black text-white font-mono">{calculatedNumContacts.toLocaleString()} Workers</div>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="p-3 rounded-xl bg-accent-500/10 text-accent-400">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{t('estimateCost')}</div>
                  <div className="text-2xl font-black text-accent-400 font-mono">₹{estimatedCost.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Launch Campaign CTA */}
            <div>
              <button
                type="button"
                onClick={handleLaunchCampaign}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 text-white font-bold text-base hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>{t('launchBtn')}</span>
              </button>
              <div className="text-center text-[11px] text-text-muted-theme mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />
                Protected by National Fair Contract Wage Policy. Rates calculated at standard Indian VoIP intervals.
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Simulator Right Panel - spans 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Audio Simulator Phone Sandbox Container */}
          <div className="glass-card rounded-2xl p-6 text-center space-y-6 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
            <div className="absolute top-0 right-0 p-3 bg-accent-500/10 rounded-bl-xl text-accent-400 uppercase text-[10px] font-bold tracking-widest border-l border-b border-subtle">
              OPERATORS SANDBOX
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                <Volume2 className="w-5 h-5 text-accent-400 animate-pulse" />
                Interactive Call Simulator
              </h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1">
                Simulate how a traditional farmer's voice call operates over phone audio channels.
              </p>
            </div>

            {/* Phone Screen Case frame representation */}
            <div className="bg-black/80 rounded-[30px] border-[5px] border-earth-800 p-5 w-64 mx-auto relative shadow-2xl flex flex-col justify-between h-[360px]">
              {/* Speaker Notch */}
              <div className="w-16 h-3 bg-earth-800 rounded-full mx-auto" />

              <AnimatePresence mode="wait">
                {callState === 'idle' && (
                  <motion.div 
                    key="idle-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full space-y-4"
                  >
                    <div className="p-4 rounded-full bg-earth-900 border border-subtle">
                      <PhoneCall className="w-10 h-10 text-text-secondary" />
                    </div>
                    <div className="text-sm font-semibold text-text-primary">Phone is Ready</div>
                    <p className="text-[10px] text-text-muted-theme text-center">
                      Click the button below to simulate an incoming IVR broadcast.
                    </p>
                  </motion.div>
                )}

                {callState === 'calling' && (
                  <motion.div 
                    key="calling-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-between h-full py-6"
                  >
                    {/* Ring state */}
                    <div className="text-center">
                      <div className="text-[10px] text-accent-400 font-bold uppercase tracking-widest animate-pulse">INCOMING HARVEST ALERT</div>
                      <div className="text-base font-black text-white mt-1">Krushi Rojgar System</div>
                      <div className="text-[10px] text-text-secondary font-mono mt-0.5">+91 22 2309 5240</div>
                    </div>

                    <div className="relative animate-bounce">
                      <div className="absolute -inset-2 bg-primary-500/20 rounded-full animate-ping" />
                      <div className="p-4 rounded-full bg-primary-600">
                        <PhoneCall className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Accept decline key controls */}
                    <div className="flex gap-8 justify-center w-full">
                      <button 
                        onClick={() => setCallState('hangup')} 
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => setCallState('active')} 
                        className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-500"
                      >
                        Accept
                      </button>
                    </div>
                  </motion.div>
                )}

                {callState === 'active' && (
                  <motion.div 
                    key="active-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-between h-full py-4"
                  >
                    <div className="text-center">
                      <div className="text-[9px] text-primary-400 font-bold uppercase tracking-widest">CALL CONNECTED</div>
                      <div className="text-sm font-semibold text-white mt-0.5">Krushi Rojgar Sandhi</div>
                      <div className="text-[10px] text-text-muted-theme mt-0.5">TTS Automated Audio Node</div>
                    </div>

                    {/* Waves equalizer effect */}
                    <div className="flex gap-1 h-12 items-center justify-center">
                      {[1, 2, 3, 4, 5, 6, 7].map((bar) => {
                        const randomDelays = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.1];
                        return (
                          <motion.div
                            key={bar}
                            className="w-1 bg-[#22c55e] rounded-full"
                            animate={{ height: ['15%', '90%', '15%'] }}
                            transition={{
                              duration: 0.7,
                              repeat: Infinity,
                              delay: randomDelays[bar - 1],
                              ease: 'easeInOut'
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Progress with audio script text scrolling */}
                    <div className="w-full space-y-1.5">
                      <div className="h-1 bg-earth-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 transition-all duration-500"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <p className="text-[8px] text-primary-200 line-clamp-2 text-center italic-none">
                        "{generateScript(selectedScriptLang).slice(0, 70)}..."
                      </p>
                    </div>

                    {/* Hang Up Action button */}
                    <button 
                      onClick={() => setCallState('hangup')} 
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Hang Up Call
                    </button>
                  </motion.div>
                )}

                {callState === 'hangup' && (
                  <motion.div 
                    key="hangup-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full space-y-3"
                  >
                    <div className="p-3 bg-red-950/20 rounded-full text-red-500 border border-red-900/30">
                      <PhoneCall className="w-8 h-8 rotate-[135deg]" />
                    </div>
                    <div className="text-sm font-semibold text-white">Call Disconnected</div>
                    <button 
                      onClick={() => setCallState('idle')} 
                      className="mt-2 text-xs text-primary-400 underline font-semibold"
                    >
                      Reset Phone Simulation
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simulated actions controller */}
            {callState === 'idle' ? (
              <button
                type="button"
                onClick={startSimulation}
                className="w-full h-11 rounded-xl bg-accent-500 hover:bg-accent-400 text-earth-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-4 h-4 fill-earth-950" />
                Simulate Call Broadcast
              </button>
            ) : (
              <button
                type="button"
                onClick={endSimulation}
                className="w-full h-11 rounded-xl bg-earth-800 hover:bg-earth-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4" />
                Terminate Simulation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Campaign List Table History */}
      <div className="mt-12 glass-card rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-subtle pb-4">
          <Layers className="w-5 h-5 text-primary-400" />
          {t('campaignListTitle')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="border-b border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-4">Campaign Title</th>
                <th className="pb-3 px-4">Recipients Targeted</th>
                <th className="pb-3 px-4">District Target</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Date scheduled</th>
                <th className="pb-3 pl-4 text-right">Fund Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="text-text-primary hover:bg-white/5 transition-colors group">
                  <td className="py-4 pr-4 font-semibold text-white max-w-xs truncate">
                    {camp.title}
                    <div className="flex gap-1.5 mt-1.5">
                      {camp.targetSkills.map(sk => (
                        <span key={sk} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-300">
                    {camp.workersCount.toLocaleString()} workers
                  </td>
                  <td className="py-4 px-4 font-body">{camp.district}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      camp.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-text-secondary">
                    {camp.scheduledDate} @ {camp.scheduledTime}
                  </td>
                  <td className="py-4 pl-4 text-right font-mono font-bold text-accent-400 text-base">
                    ₹{camp.estimatedCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Launcher Dialog */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-lg w-full rounded-2xl p-6 md:p-8 space-y-6 relative border-emerald-900 shadow-2xl"
          >
            <div className="text-center text-white space-y-2">
              <span className="p-3 bg-accent-500/10 rounded-full inline-block text-accent-400 mb-2">
                <Users className="w-10 h-10 mx-auto animate-pulse" />
              </span>
              <h4 className="text-2xl font-black">Verify Voice Broadcast parameters</h4>
              <p className="text-sm text-text-secondary">
                You are authorizing a VoIP automated dial-out to the agricultural worker database.
              </p>
            </div>

            {/* Campaign Breakdown billing representation */}
            <div className="space-y-3.5 bg-black/40 rounded-xl p-5 border border-subtle">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Campaign Name:</span>
                <span className="text-white font-semibold">{campaignTitle}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Region Target:</span>
                <span className="text-white font-semibold">{selectedDistrict}, Maharashtra</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Selected Core Skills:</span>
                <span className="text-white font-mono text-xs">{selectedSkills.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Total Targeted Callers:</span>
                <span className="text-primary-400 font-bold font-mono">{calculatedNumContacts.toLocaleString()} workers</span>
              </div>
              <div className="h-px bg-subtle my-2" />
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-accent-400 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  Estimated Broadcast Funds:
                </span>
                <span className="text-accent-400 font-mono text-xl">₹{estimatedCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Priority vs basic plan overview */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex gap-2 items-start text-xs text-text-secondary">
              <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                As a <strong>PRO Plan</strong> host, you receive immediate priority telecom routing. Audio scripts are automatically transcribed into high-clarity synthesized text-to-speech files.
              </span>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="h-12 rounded-xl bg-earth-800 hover:bg-earth-700 text-white font-bold transition-all text-sm cursor-pointer"
              >
                Back to Config
              </button>

              <button
                type="button"
                onClick={confirmCampaign}
                disabled={isLaunching}
                className="h-12 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-black transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Launching VoIP...
                  </>
                ) : (
                  <>Authorize & Pay</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
