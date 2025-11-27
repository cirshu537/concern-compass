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
import TrainerDocs from "./pages/TrainerDocs";
import TrainerProfile from "./pages/TrainerProfile";
import StaffDashboard from "./pages/StaffDashboard";
import StaffDocs from "./pages/StaffDocs";
import BranchAdminDashboard from "./pages/BranchAdminDashboard";
import BranchAdminAllComplaints from "./pages/BranchAdminAllComplaints";
import MainAdminDashboard from "./pages/MainAdminDashboard";
import AdminDocs from "./pages/AdminDocs";
import AdminStudentProfile from "./pages/AdminStudentProfile";
import ChatPage from "./pages/ChatPage";
import RegisterExclusiveHandler from "./pages/RegisterExclusiveHandler";
import ComplaintDetailsPage from "./pages/ComplaintDetailsPage";

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
            <Route path="/trainer/profile" element={<TrainerProfile />} />
            <Route path="/trainer/docs" element={<TrainerDocs />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/profile" element={<StudentProfile />} />
            <Route path="/staff/docs" element={<StaffDocs />} />
          <Route path="/branch-admin/dashboard" element={<BranchAdminDashboard />} />
          <Route path="/branch-admin/all-complaints" element={<BranchAdminAllComplaints />} />
            <Route path="/main-admin/dashboard" element={<MainAdminDashboard />} />
            <Route path="/admin/docs" element={<AdminDocs />} />
            <Route path="/admin/student-profile/:studentId" element={<AdminStudentProfile />} />
            <Route path="/complaint/:complaintId" element={<ComplaintDetailsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/register-exclusive-handler" element={<RegisterExclusiveHandler />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;