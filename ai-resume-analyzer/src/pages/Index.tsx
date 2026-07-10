import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, FileSearch } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center measurement-grid">
        <div className="max-w-[640px] mx-auto px-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary/10 rounded mb-6">
            <div className="size-1.5 bg-primary rounded-full animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-semibold">
              AI-Powered Assessment Engine
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter leading-[0.95] mb-6">
            Your career clarity,{" "}
            <span className="text-muted-foreground">powered by AI.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-[50ch] mx-auto leading-relaxed mb-12">
            Upload your resume for intelligent analysis, job role matching,
            interview preparation, and personalized study plans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/job-roles" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="gap-3 group h-14 rounded-lg w-full sm:w-auto px-8">
                <Briefcase className="size-5" />
                <span className="font-medium">Job Role Suggestions</span>
              </Button>
            </Link>
            <Link to="/analyzer" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="gap-3 h-14 rounded-lg w-full sm:w-auto px-8">
                <FileSearch className="size-5" />
                <span className="font-medium">Analyze Resume</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[11px] text-muted-foreground">
            © 2026 ResumeAI — AI-Based Intelligent Resume Assessment System
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Privacy-First • No Data Storage
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
