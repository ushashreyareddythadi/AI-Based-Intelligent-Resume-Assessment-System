import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 glass-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-5 bg-foreground rounded-sm flex items-center justify-center">
              <div className="size-1.5 bg-background rounded-full" />
            </div>
            <span className="font-medium tracking-tight text-sm">ResumeAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/job-roles"
              className={`text-[13px] transition-colors ${
                location.pathname === "/job-roles" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Job Role Suggestions
            </Link>
            <Link
              to="/analyzer"
              className={`text-[13px] transition-colors ${
                location.pathname === "/analyzer" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resume Analyzer
            </Link>
            <Link
              to="/interview"
              className={`text-[13px] transition-colors ${
                location.pathname === "/interview" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Interview Prep
            </Link>
            <Link
              to="/study-plan"
              className={`text-[13px] transition-colors ${
                location.pathname === "/study-plan" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Study Plan
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest hidden sm:block">
            AI-Powered
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
