/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppView = 'home' | 'marketplace' | 'dashboard' | 'ivr' | 'pricing' | 'about' | 'contact';

export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'farmer' | 'worker' | 'contractor';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
  locationState: string;
  locationDistrict: string;
  isPremium: boolean;
  token?: string;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  district: string;
  postedDate: string;
  wage: number; // e.g. 550 for daily wage ₹550
  wageType: 'day' | 'job' | 'month';
  skills: string[];
  farmerName: string;
  farmerRating: number;
  applicantsCount: number;
  description: string;
  duration: string;
  requiredWorkers: number;
  matchPercentage?: number;
  applications?: JobApplication[];
}

export interface JobApplication {
  id: string;
  workerName: string;
  workerPhone: string;
  workerSkills: string[];
  workerRating: number;
  status: 'pending' | 'accepted' | 'declined';
  appliedDate: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  role: 'worker' | 'contractor';
  skills: string[];
  rating: number;
  completedJobs: number;
  district: string;
  phone: string;
  avatarUrl?: string;
  isAvailable: boolean;
  dailyRate: number;
}

export interface IVRCampaign {
  id: string;
  title: string;
  targetSkills: string[];
  district: string;
  messageScript: {
    en: string;
    hi: string;
    mr: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  workersCount: number;
  status: 'draft' | 'scheduled' | 'broadcasting' | 'completed';
  estimatedCost: number;
}

export interface ActivityLog {
  id: string;
  type: 'job_posted' | 'application_received' | 'job_accepted' | 'payment_processed' | 'ivr_launched';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}
