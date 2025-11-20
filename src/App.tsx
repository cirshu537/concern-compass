import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/StudentDashboard";
import StudentRaise from "./pages/StudentRaise";
import StudentStatus from "./pages/StudentStatus";
import StudentProfile from "./pages/StudentProfile";
import StudentDocs from "./pages/StudentDocs";
import TrainerDashboard from "./pages/TrainerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import BranchAdminDashboard from "./pages/BranchAdminDashboard";
import MainAdminDashboard from "./pages/MainAdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/raise" element={<StudentRaise />} />
            <Route path="/student/status" element={<StudentStatus />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/docs" element={<StudentDocs />} />
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/branch-admin/dashboard" element={<BranchAdminDashboard />} />
            <Route path="/main-admin/dashboard" element={<MainAdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;