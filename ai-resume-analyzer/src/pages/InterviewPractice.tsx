import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useResumeContext } from "@/contexts/ResumeContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScoreCard from "@/components/ScoreCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle, Home, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  type: "mcq" | "technical" | "hr";
  options?: string[];
  correctAnswer?: string;
}

interface Evaluation {
  overallScore: number;
  feedback: string;
  strengths: string[];
  weakAreas: string[];
}

const InterviewPractice = () => {
  const navigate = useNavigate();
  const { resumeText, jobRole, matchedSkills, missingSkills, setWeakAreas } = useResumeContext();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  // Redirect if no analysis has been run yet
  useEffect(() => {
    if (!jobRole || matchedSkills.length === 0) {
      toast.error("Please analyze your resume first before practicing interviews.");
      navigate("/analyzer");
    }
  }, [jobRole, matchedSkills, navigate]);

  const skills = matchedSkills.join(", ");

  const generateQuestions = async () => {
    if (!skills || !jobRole) return toast.error("No skills or job role found. Please analyze your resume first.");
    setLoading(true);
    setQuestions(null);
    setEvaluation(null);
    setAnswers({});

    try {
      const { data, error } = await supabase.functions.invoke("generate-interview", {
        body: { skills, jobRole },
      });
      if (error) throw error;
      setQuestions(data.questions);
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    if (!questions) return;
    const unanswered = questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) return toast.error(`Please answer all ${unanswered.length} remaining questions`);

    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-answers", {
        body: {
          jobRole,
          questions: questions.map((q) => ({
            question: q.question,
            answer: answers[q.id],
            type: q.type,
            correctAnswer: q.correctAnswer,
          })),
        },
      });
      if (error) throw error;
      setEvaluation(data.evaluation);
      // Store weak areas for study plan
      if (data.evaluation?.weakAreas) {
        setWeakAreas(data.evaluation.weakAreas);
      }
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      toast.error(error.message || "Failed to evaluate answers");
    } finally {
      setEvaluating(false);
    }
  };

  if (!jobRole || matchedSkills.length === 0) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8 animate-fade-in">
          <span className="font-mono text-[11px] text-primary uppercase tracking-widest block mb-2">
            Module 03
          </span>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Interview Practice</h1>
          <p className="text-muted-foreground">
            AI generates interview questions based on your resume skills and evaluates your answers.
          </p>
        </div>

        {/* Context info */}
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <span><span className="text-muted-foreground">Role:</span> <span className="font-medium">{jobRole}</span></span>
            <span className="text-muted-foreground">•</span>
            <span><span className="text-muted-foreground">Skills:</span> <span className="font-medium">{skills || "N/A"}</span></span>
          </div>
        </div>

        {!questions && !evaluation && (
          <div className="space-y-6 animate-slide-up">
            <Button
              onClick={generateQuestions}
              disabled={loading}
              className="w-full h-12 rounded-lg gap-2"
            >
              Generate Interview Questions
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

        {loading && <LoadingSpinner message="Generating interview questions..." />}

        {questions && !evaluation && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-mono text-[11px] text-primary uppercase tracking-widest">
                Interview Questions ({questions.length})
              </h2>
              <span className="text-xs text-muted-foreground">
                {Object.keys(answers).filter((k) => answers[Number(k)]?.trim()).length}/{questions.length} answered
              </span>
            </div>

            {questions.map((q) => (
              <div key={q.id} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${
                      q.type === "mcq"
                        ? "bg-accent/10 text-accent-foreground border border-border"
                        : q.type === "technical"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {q.type}
                  </span>
                  <p className="text-sm font-medium flex-1">{q.question}</p>
                </div>
                {q.type === "mcq" && q.options ? (
                  <div className="space-y-2 pl-2">
                    {q.options.map((opt, i) => (
                      <label
                        key={i}
                        className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer transition-colors ${
                          answers[q.id] === opt
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-secondary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className="mt-0.5"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    placeholder="Type your answer..."
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    className="min-h-[80px]"
                  />
                )}
              </div>
            ))}

            <Button
              onClick={submitAnswers}
              disabled={evaluating}
              className="w-full h-12 rounded-lg gap-2"
            >
              Submit Answers
              <CheckCircle className="size-4" />
            </Button>

            <Link to="/">
              <Button variant="outline" className="gap-2">
                <Home className="size-4" />
                Home
              </Button>
            </Link>
          </div>
        )}

        {evaluating && <LoadingSpinner message="Evaluating your answers..." />}

        {evaluation && (
          <div className="mt-2 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreCard label="Overall Score" value={evaluation.overallScore} suffix="%" />
              <div className="p-4 border border-border rounded-lg">
                <span className="font-mono text-[10px] text-muted-foreground block mb-1 uppercase tracking-widest">
                  Summary
                </span>
                <p className="text-sm">{evaluation.feedback}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-mono text-[10px] text-primary uppercase tracking-widest mb-3">
                  Strengths
                </h3>
                <ul className="space-y-1">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-mono text-[10px] text-destructive uppercase tracking-widest mb-3">
                  Areas to Improve
                </h3>
                <ul className="space-y-1">
                  {evaluation.weakAreas.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
              <Link to="/study-plan">
                <Button className="gap-2">
                  <BookOpen className="size-4" />
                  Generate Study Plan
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setQuestions(null);
                  setEvaluation(null);
                  setAnswers({});
                }}
                variant="outline"
                className="gap-2"
              >
                Practice Again
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

export default InterviewPractice;
