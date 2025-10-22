import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FindTutor from "./pages/FindTutor";
import TutorRegistration from "./pages/TutorRegistration";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import TutorProfile from "./pages/TutorProfile";
import InteractiveLearning from "./pages/InteractiveLearning";
import Scheduling from "./pages/Scheduling";
import Payment from "./pages/Payment";
import Support from "./pages/Support";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";
import BookSession from "./pages/BookSession";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/find-tutor" element={<FindTutor />} />
                <Route 
                  path="/book-session/:tutorId" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <BookSession />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/register-tutor" 
                  element={
                    <ProtectedRoute allowedRoles={['tutor']}>
                      <TutorRegistration />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tutor-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['tutor']}>
                      <TutorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tutor-profile" 
                  element={
                    <ProtectedRoute allowedRoles={['tutor']}>
                      <TutorProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning-demo" 
                  element={
                    <ProtectedRoute>
                      <InteractiveLearning />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/schedule" 
                  element={
                    <ProtectedRoute>
                      <Scheduling />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payments" 
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/support" element={<Support />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
