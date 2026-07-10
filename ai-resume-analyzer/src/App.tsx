import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider } from "@/contexts/ResumeContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index.tsx";
import JobRoles from "./pages/JobRoles.tsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.tsx";
import InterviewPractice from "./pages/InterviewPractice.tsx";
import StudyPlan from "./pages/StudyPlan.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ResumeProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/job-roles" element={<JobRoles />} />
            <Route path="/analyzer" element={<ResumeAnalyzer />} />
            <Route path="/interview" element={<InterviewPractice />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ResumeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
