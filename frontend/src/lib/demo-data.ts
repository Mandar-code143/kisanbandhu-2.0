export type UserRole = 'farmer' | 'worker' | 'admin';

export interface DemoUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  language: 'en' | 'hi' | 'mr';
  verified: boolean;
  rating: number;
  reviewCount: number;
  joinedDate: string;
}

export const demoUsers: Record<string, DemoUser> = {
  farmer: {
    id: 'f1',
    name: 'Rajesh Patil',
    phone: '9876543210',
    email: 'rajesh@example.com',
    role: 'farmer',
    village: 'Shindewadi',
    taluka: 'Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    language: 'mr',
    verified: true,
    rating: 4.7,
    reviewCount: 23,
    joinedDate: '2024-03-15',
  },
  worker: {
    id: 'w1',
    name: 'Sunita Jadhav',
    phone: '9123456780',
    role: 'worker',
    village: 'Nimgaon',
    taluka: 'Indapur',
    district: 'Pune',
    state: 'Maharashtra',
    language: 'mr',
    verified: true,
    rating: 4.9,
    reviewCount: 45,
    joinedDate: '2024-01-20',
  },
  admin: {
    id: 'a1',
    name: 'Priya Sharma',
    phone: '9000000001',
    email: 'admin@krushi.in',
    role: 'admin',
    village: '',
    taluka: '',
    district: 'Pune',
    state: 'Maharashtra',
    language: 'en',
    verified: true,
    rating: 0,
    reviewCount: 0,
    joinedDate: '2023-12-01',
  },
};

export interface Job {
  id: string;
  title: string;
  workType: string;
  cropType: string;
  farmerId: string;
  farmerName: string;
  location: string;
  district: string;
  date: string;
  duration: string;
  workersNeeded: number;
  workersAccepted: number;
  wage: number;
  wageType: 'daily' | 'hourly' | 'fixed';
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  foodIncluded: boolean;
  transportIncluded: boolean;
  skills: string[];
  postedAt: string;
}

export const demoJobs: Job[] = [
  {
    id: 'j1', title: 'Sugarcane Harvesting', workType: 'Harvesting', cropType: 'Sugarcane',
    farmerId: 'f1', farmerName: 'Rajesh Patil', location: 'Shindewadi, Baramati', district: 'Pune',
    date: '2026-03-15', duration: '3 days', workersNeeded: 8, workersAccepted: 5,
    wage: 450, wageType: 'daily', urgency: 'urgent', status: 'open',
    foodIncluded: true, transportIncluded: false, skills: ['Harvesting', 'Physical Labor'],
    postedAt: '2026-03-06',
  },
  {
    id: 'j2', title: 'Cotton Picking', workType: 'Picking', cropType: 'Cotton',
    farmerId: 'f2', farmerName: 'Manoj Deshmukh', location: 'Wadgaon, Ahmednagar', district: 'Ahmednagar',
    date: '2026-03-20', duration: '5 days', workersNeeded: 12, workersAccepted: 3,
    wage: 400, wageType: 'daily', urgency: 'normal', status: 'open',
    foodIncluded: true, transportIncluded: true, skills: ['Picking', 'Cotton'],
    postedAt: '2026-03-05',
  },
  {
    id: 'j3', title: 'Paddy Transplanting', workType: 'Transplanting', cropType: 'Rice',
    farmerId: 'f3', farmerName: 'Anita Gaikwad', location: 'Karad, Satara', district: 'Satara',
    date: '2026-03-18', duration: '2 days', workersNeeded: 6, workersAccepted: 6,
    wage: 500, wageType: 'daily', urgency: 'normal', status: 'in_progress',
    foodIncluded: true, transportIncluded: false, skills: ['Transplanting', 'Paddy'],
    postedAt: '2026-03-03',
  },
  {
    id: 'j4', title: 'Grape Pruning', workType: 'Pruning', cropType: 'Grape',
    farmerId: 'f4', farmerName: 'Vinod Kale', location: 'Nasik Road, Nasik', district: 'Nasik',
    date: '2026-03-22', duration: '4 days', workersNeeded: 10, workersAccepted: 0,
    wage: 550, wageType: 'daily', urgency: 'critical', status: 'open',
    foodIncluded: true, transportIncluded: true, skills: ['Pruning', 'Grape Farming'],
    postedAt: '2026-03-07',
  },
  {
    id: 'j5', title: 'Onion Sorting & Packing', workType: 'Sorting', cropType: 'Onion',
    farmerId: 'f1', farmerName: 'Rajesh Patil', location: 'Shindewadi, Baramati', district: 'Pune',
    date: '2026-03-12', duration: '1 day', workersNeeded: 4, workersAccepted: 4,
    wage: 350, wageType: 'daily', urgency: 'normal', status: 'completed',
    foodIncluded: false, transportIncluded: false, skills: ['Sorting', 'Packing'],
    postedAt: '2026-03-01',
  },
];

export interface Worker {
  id: string;
  name: string;
  village: string;
  district: string;
  skills: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  dailyWage: number;
  available: boolean;
  verified: boolean;
  languages: string[];
  gender: 'male' | 'female' | 'other';
  age: number;
  completedJobs: number;
}

export const demoWorkers: Worker[] = [
  { id: 'w1', name: 'Sunita Jadhav', village: 'Nimgaon, Indapur', district: 'Pune', skills: ['Harvesting', 'Transplanting', 'Weeding'], experience: 8, rating: 4.9, reviewCount: 45, dailyWage: 400, available: true, verified: true, languages: ['Marathi', 'Hindi'], gender: 'female', age: 34, completedJobs: 87 },
  { id: 'w2', name: 'Ganesh More', village: 'Koregaon, Satara', district: 'Satara', skills: ['Tractor Operation', 'Plowing', 'Harvesting'], experience: 12, rating: 4.8, reviewCount: 62, dailyWage: 550, available: true, verified: true, languages: ['Marathi'], gender: 'male', age: 42, completedJobs: 134 },
  { id: 'w3', name: 'Lakshmi Bhosale', village: 'Phaltan, Satara', district: 'Satara', skills: ['Cotton Picking', 'Sorting', 'Grape Pruning'], experience: 5, rating: 4.6, reviewCount: 28, dailyWage: 380, available: true, verified: true, languages: ['Marathi', 'Hindi'], gender: 'female', age: 29, completedJobs: 52 },
  { id: 'w4', name: 'Ramesh Shirke', village: 'Baramati', district: 'Pune', skills: ['Spraying', 'Irrigation', 'Equipment Repair'], experience: 15, rating: 4.7, reviewCount: 51, dailyWage: 500, available: false, verified: true, languages: ['Marathi', 'Hindi', 'English'], gender: 'male', age: 48, completedJobs: 198 },
  { id: 'w5', name: 'Meena Waghmare', village: 'Junnar, Pune', district: 'Pune', skills: ['Weeding', 'Transplanting', 'Vegetable Farming'], experience: 6, rating: 4.5, reviewCount: 19, dailyWage: 370, available: true, verified: false, languages: ['Marathi'], gender: 'female', age: 31, completedJobs: 38 },
  { id: 'w6', name: 'Anil Kadam', village: 'Pandharpur, Solapur', district: 'Solapur', skills: ['Harvesting', 'Loading', 'Physical Labor'], experience: 10, rating: 4.4, reviewCount: 33, dailyWage: 420, available: true, verified: true, languages: ['Marathi', 'Hindi'], gender: 'male', age: 38, completedJobs: 76 },
];

export interface Equipment {
  id: string;
  type: string;
  name: string;
  brand: string;
  ownerName: string;
  ownerId: string;
  location: string;
  district: string;
  pricePerDay: number;
  pricePerHour?: number;
  rating: number;
  reviewCount: number;
  available: boolean;
  operatorIncluded: boolean;
  condition: 'excellent' | 'good' | 'fair';
  year: number;
  fuelType: string;
  image?: string;
}

export const demoEquipment: Equipment[] = [
  { id: 'e1', type: 'Tractor', name: 'Mahindra 575 DI', brand: 'Mahindra', ownerName: 'Rajesh Patil', ownerId: 'f1', location: 'Baramati', district: 'Pune', pricePerDay: 2500, pricePerHour: 400, rating: 4.8, reviewCount: 18, available: true, operatorIncluded: true, condition: 'excellent', year: 2022, fuelType: 'Diesel' },
  { id: 'e2', type: 'Rotavator', name: 'Shaktiman Rotavator 6ft', brand: 'Shaktiman', ownerName: 'Manoj Deshmukh', ownerId: 'f2', location: 'Ahmednagar', district: 'Ahmednagar', pricePerDay: 1800, rating: 4.5, reviewCount: 12, available: true, operatorIncluded: false, condition: 'good', year: 2021, fuelType: 'N/A' },
  { id: 'e3', type: 'Harvester', name: 'John Deere W70', brand: 'John Deere', ownerName: 'Vinod Kale', ownerId: 'f4', location: 'Nasik', district: 'Nasik', pricePerDay: 5000, pricePerHour: 800, rating: 4.9, reviewCount: 25, available: false, operatorIncluded: true, condition: 'excellent', year: 2023, fuelType: 'Diesel' },
  { id: 'e4', type: 'Sprayer', name: 'Honda Power Sprayer', brand: 'Honda', ownerName: 'Anita Gaikwad', ownerId: 'f3', location: 'Karad', district: 'Satara', pricePerDay: 800, rating: 4.3, reviewCount: 8, available: true, operatorIncluded: false, condition: 'good', year: 2020, fuelType: 'Petrol' },
  { id: 'e5', type: 'Seed Drill', name: 'Khedut Seed Drill 9 Row', brand: 'Khedut', ownerName: 'Rajesh Patil', ownerId: 'f1', location: 'Baramati', district: 'Pune', pricePerDay: 1500, rating: 4.6, reviewCount: 14, available: true, operatorIncluded: false, condition: 'fair', year: 2019, fuelType: 'N/A' },
];

export interface Scheme {
  id: string;
  title: string;
  titleHi: string;
  titleMr: string;
  summary: string;
  category: string;
  type: 'central' | 'state';
  eligibility: string;
  benefits: string;
  lastDate?: string;
  status: 'active' | 'upcoming' | 'closed';
  documents: string[];
  forRole: 'farmer' | 'worker' | 'both';
}

export const demoSchemes: Scheme[] = [
  { id: 's1', title: 'PM-KISAN Samman Nidhi', titleHi: 'पीएम-किसान सम्मान निधि', titleMr: 'पीएम-किसान सन्मान निधी', summary: 'Direct income support of ₹6,000 per year to farmer families.', category: 'Subsidy', type: 'central', eligibility: 'Small and marginal farmers with cultivable land', benefits: '₹6,000/year in 3 installments', lastDate: '2026-06-30', status: 'active', documents: ['Aadhaar Card', 'Land Records', 'Bank Passbook'], forRole: 'farmer' },
  { id: 's2', title: 'PMFBY - Crop Insurance', titleHi: 'पीएमएफबीवाय - फसल बीमा', titleMr: 'पीएमएफबीवाय - पीक विमा', summary: 'Comprehensive crop insurance at minimal premium for farmers.', category: 'Insurance', type: 'central', eligibility: 'All farmers including tenant farmers', benefits: 'Coverage against crop loss due to natural calamities', lastDate: '2026-07-15', status: 'active', documents: ['Aadhaar Card', 'Land Records', 'Sowing Certificate', 'Bank Details'], forRole: 'farmer' },
  { id: 's3', title: 'MGNREGA Employment', titleHi: 'मनरेगा रोजगार', titleMr: 'मनरेगा रोजगार', summary: 'Guaranteed 100 days of wage employment per year.', category: 'Employment', type: 'central', eligibility: 'Rural households willing to do manual work', benefits: '100 days employment at ₹300-350/day', status: 'active', documents: ['Aadhaar Card', 'Job Card', 'Bank Account'], forRole: 'worker' },
  { id: 's4', title: 'Maharashtra Shetkari Yojana', titleHi: 'महाराष्ट्र शेतकरी योजना', titleMr: 'महाराष्ट्र शेतकरी योजना', summary: 'State-level support for Maharashtra farmers for irrigation and seeds.', category: 'Irrigation', type: 'state', eligibility: 'Maharashtra domicile farmers', benefits: 'Up to ₹50,000 subsidy on irrigation equipment', lastDate: '2026-12-31', status: 'active', documents: ['Aadhaar Card', '7/12 Extract', 'Domicile Certificate'], forRole: 'farmer' },
];

export interface Notification {
  id: string;
  type: 'job' | 'booking' | 'weather' | 'scheme' | 'system' | 'verification';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export const demoNotifications: Notification[] = [
  { id: 'n1', type: 'job', title: 'New Job Match', message: 'Sugarcane harvesting job near Baramati matches your skills.', read: false, timestamp: '2026-03-08T09:00:00', actionUrl: '/worker/jobs/j1' },
  { id: 'n2', type: 'weather', title: 'Rain Alert', message: 'Heavy rainfall expected in Pune district tomorrow. Plan accordingly.', read: false, timestamp: '2026-03-08T07:30:00' },
  { id: 'n3', type: 'booking', title: 'Booking Confirmed', message: 'Tractor booking for March 15 confirmed by Rajesh Patil.', read: true, timestamp: '2026-03-07T14:00:00' },
  { id: 'n4', type: 'scheme', title: 'New Scheme Available', message: 'Maharashtra Shetkari Yojana applications now open.', read: true, timestamp: '2026-03-06T10:00:00', actionUrl: '/farmer/schemes/s4' },
  { id: 'n5', type: 'verification', title: 'Profile Verified', message: 'Your identity documents have been verified successfully.', read: true, timestamp: '2026-03-05T16:00:00' },
];

export const weatherData = {
  location: 'Baramati, Pune',
  current: { temp: 32, humidity: 45, wind: 12, condition: 'Partly Cloudy', feelsLike: 34 },
  hourly: [
    { time: '9 AM', temp: 28, condition: 'Sunny' },
    { time: '12 PM', temp: 33, condition: 'Partly Cloudy' },
    { time: '3 PM', temp: 35, condition: 'Partly Cloudy' },
    { time: '6 PM', temp: 30, condition: 'Clear' },
    { time: '9 PM', temp: 26, condition: 'Clear' },
  ],
  weekly: [
    { day: 'Mon', high: 34, low: 22, condition: 'Sunny', rain: 0 },
    { day: 'Tue', high: 33, low: 21, condition: 'Partly Cloudy', rain: 10 },
    { day: 'Wed', high: 30, low: 20, condition: 'Rainy', rain: 70 },
    { day: 'Thu', high: 28, low: 19, condition: 'Rainy', rain: 80 },
    { day: 'Fri', high: 31, low: 20, condition: 'Cloudy', rain: 30 },
    { day: 'Sat', high: 33, low: 21, condition: 'Sunny', rain: 5 },
    { day: 'Sun', high: 34, low: 22, condition: 'Sunny', rain: 0 },
  ],
  advisory: 'Good conditions for spraying today. Rain expected Wednesday — postpone irrigation and plan harvesting before then.',
  sunrise: '6:32 AM',
  sunset: '6:18 PM',
};

export const adminStats = {
  totalUsers: 12847,
  totalFarmers: 8234,
  totalWorkers: 4213,
  verifiedWorkers: 3156,
  activeJobs: 342,
  successfulMatches: 8921,
  activeEquipment: 567,
  disputes: 12,
  adRevenue: 234500,
  schemeEngagement: 4532,
};
