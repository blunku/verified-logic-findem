import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import CandidateDashboard from "./pages/CandidateDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import Auth from "./pages/Auth";
import Report from "./pages/Report";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Challenge from "./pages/Challenge";
import Referrals from "./pages/Referrals";
import Companies from "./pages/Companies";
import InterviewPrep from "./pages/InterviewPrep";
import Badge from "./pages/Badge";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/candidate" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/challenge" element={<ProtectedRoute><Challenge /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
          <Route path="/badge/:username" element={<Badge />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
