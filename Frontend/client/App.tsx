import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FindTutor from "./pages/FindTutor";
import TutorRegistration from "./pages/TutorRegistration";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import InteractiveLearning from "./pages/InteractiveLearning";
import Scheduling from "./pages/Scheduling";
import Payment from "./pages/Payment";
import Support from "./pages/Support";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/find-tutor" element={<FindTutor />} />
              <Route path="/register-tutor" element={<TutorRegistration />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/tutor-dashboard" element={<TutorDashboard />} />
              <Route path="/learning-demo" element={<InteractiveLearning />} />
              <Route path="/schedule" element={<Scheduling />} />
              <Route path="/payments" element={<Payment />} />
              <Route path="/support" element={<Support />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
