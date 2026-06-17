import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import PublicLayout from "@/components/layout/PublicLayout";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import FarmerDashboard from "@/pages/farmer/Dashboard";
import FarmerJobs from "@/pages/farmer/Jobs";
import JobPost from "@/pages/farmer/JobPost";
import IVRPage from "@/pages/farmer/IVR";
import WorkerDiscovery from "@/pages/farmer/Workers";
import EquipmentMarketplace from "@/pages/farmer/Equipment";
import Schemes from "@/pages/farmer/Schemes";
import Weather from "@/pages/farmer/Weather";

import WorkerDashboard from "@/pages/worker/Dashboard";
import WorkerJobs from "@/pages/worker/Jobs";
import WorkerBookings from "@/pages/worker/Bookings";
import WorkerEarnings from "@/pages/worker/Earnings";

import AdminDashboard from "@/pages/admin/Dashboard";

import Notifications from "@/pages/shared/Notifications";
import Profile from "@/pages/shared/Profile";
import Settings from "@/pages/shared/Settings";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<Landing />} />
              <Route path="/contact" element={<Landing />} />
              <Route path="/faq" element={<Landing />} />
              <Route path="/privacy" element={<Landing />} />
              <Route path="/terms" element={<Landing />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Farmer */}
            <Route element={<AppLayout />}>
              <Route path="/farmer" element={<FarmerDashboard />} />
              <Route path="/farmer/jobs" element={<FarmerJobs />} />
              <Route path="/farmer/jobs/new" element={<JobPost />} />
              <Route path="/farmer/ivr" element={<IVRPage />} />
              <Route path="/farmer/jobs/:id" element={<FarmerJobs />} />
              <Route path="/farmer/workers" element={<WorkerDiscovery />} />
              <Route path="/farmer/equipment" element={<EquipmentMarketplace />} />
              <Route path="/farmer/equipment/new" element={<EquipmentMarketplace />} />
              <Route path="/farmer/schemes" element={<Schemes />} />
              <Route path="/farmer/weather" element={<Weather />} />
              <Route path="/farmer/notifications" element={<Notifications />} />
              <Route path="/farmer/profile" element={<Profile />} />
              <Route path="/farmer/settings" element={<Settings />} />
              <Route path="/farmer/help" element={<Profile />} />
            </Route>

            {/* Worker */}
            <Route element={<AppLayout />}>
              <Route path="/worker" element={<WorkerDashboard />} />
              <Route path="/worker/jobs" element={<WorkerJobs />} />
              <Route path="/worker/jobs/:id" element={<WorkerJobs />} />
              <Route path="/worker/bookings" element={<WorkerBookings />} />
              <Route path="/worker/earnings" element={<WorkerEarnings />} />
              <Route path="/worker/schemes" element={<Schemes />} />
              <Route path="/worker/weather" element={<Weather />} />
              <Route path="/worker/notifications" element={<Notifications />} />
              <Route path="/worker/profile" element={<Profile />} />
              <Route path="/worker/settings" element={<Settings />} />
              <Route path="/worker/help" element={<Profile />} />
            </Route>

            {/* Admin */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/verification" element={<AdminDashboard />} />
              <Route path="/admin/jobs" element={<AdminDashboard />} />
              <Route path="/admin/equipment" element={<AdminDashboard />} />
              <Route path="/admin/schemes" element={<AdminDashboard />} />
              <Route path="/admin/ads" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminDashboard />} />
              <Route path="/admin/disputes" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
