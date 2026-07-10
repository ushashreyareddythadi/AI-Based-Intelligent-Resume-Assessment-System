import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useResumeContext } from "@/contexts/ResumeContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

interface StudyDay {
  day: number;
  date: string;
  topic: string;
  tasks: string[];
  resources: string[];
  hours: number;
}

interface StudyPlanResult {
  title: string;
  totalDays: number;
  dailyHours: number;
  weakSkills: string[];
  schedule: StudyDay[];
}

const StudyPlan = () => {
  const navigate = useNavigate();
  const { weakAreas, missingSkills, jobRole } = useResumeContext();
  const [deadline, setDeadline] = useState("");
  const [dailyHours, setDailyHours] = useState("2");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanResult | null>(null);

  // Derive weak skills from context
  const weakSkills = [...new Set([...weakAreas, ...missingSkills])].join(", ");

  useEffect(() => {
    if (!weakSkills && !jobRole) {
      toast.error("Please complete the resume analysis and interview practice first.");
      navigate("/analyzer");
    }
  }, [weakSkills, jobRole, navigate]);

  const generatePlan = async () => {
    if (!deadline) return toast.error("Please set a deadline — it is required to generate a study plan.");
    if (!dailyHours) return toast.error("Please enter daily hours");

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate <= today) return toast.error("Deadline must be a future date");

    setLoading(true);
    setPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-study-plan", {
        body: {
          weakSkills,
          deadline,
          dailyHours: Number(dailyHours),
        },
      });
      if (error) throw error;
      setPlan(data.plan);
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      toast.error(error.message || "Failed to generate study plan");
    } finally {
      setLoading(false);
    }
  };

  if (!weakSkills && !jobRole) return null;

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8 animate-fade-in">
          <span className="font-mono text-[11px] text-primary uppercase tracking-widest block mb-2">
            Module 04
          </span>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Study Plan Generator</h1>
          <p className="text-muted-foreground">
            A personalized learning roadmap based on your skill gaps identified from the analysis.
          </p>
        </div>

        {/* Skills from context */}
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg mb-6">
          <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
            Skills to Improve (Auto-detected)
          </h3>
          <div className="flex flex-wrap gap-1">
            {[...new Set([...weakAreas, ...missingSkills])].map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {!plan && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Deadline <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  min={minDate}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Daily Hours Available</label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            <Button
              onClick={generatePlan}
              disabled={loading || !deadline}
              className="w-full h-12 rounded-lg gap-2"
            >
              Generate Study Plan
              <ArrowRight className="size-4" />
            </Button>
            <Link to="/">
              <Button variant="outline" className="gap-2 mt-2">
                <Home className="size-4" />
                Home
              </Button>
            </Link>
          </div>
        )}

        {loading && <LoadingSpinner message="Creating your personalized study plan..." />}

        {plan && (
          <div className="mt-2 space-y-8 animate-fade-in">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
              <h2 className="text-lg font-medium mb-2">{plan.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{plan.totalDays} days</span>
                <span>•</span>
                <span>{plan.dailyHours} hrs/day</span>
                <span>•</span>
                <span>
                  Focus: {plan.weakSkills.join(", ")}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {plan.schedule.map((day) => (
                <div
                  key={day.day}
                  className="p-4 border border-border rounded-lg hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="size-8 bg-foreground text-background rounded-full flex items-center justify-center font-mono text-xs">
                        {day.day}
                      </span>
                      <div>
                        <span className="text-sm font-medium">{day.topic}</span>
                        <span className="text-xs text-muted-foreground block">{day.date}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{day.hours}h</span>
                  </div>
                  <ul className="space-y-1 mb-2">
                    {day.tasks.map((task, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span> {task}
                      </li>
                    ))}
                  </ul>
                  {day.resources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {day.resources.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-secondary text-[10px] font-mono rounded"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-border">
              <Button
                onClick={() => setPlan(null)}
                variant="outline"
                className="gap-2"
              >
                Create New Plan
                <ArrowRight className="size-4" />
              </Button>
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <Home className="size-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlan;
