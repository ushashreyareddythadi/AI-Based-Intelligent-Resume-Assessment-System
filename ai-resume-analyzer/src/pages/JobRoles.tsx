import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ResumeUpload from "@/components/ResumeUpload";
import { readResumeAsText } from "@/lib/extractPdf";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

interface JobRole {
  title: string;
  matchPercentage: number;
  description: string;
  keySkills: string[];
}

const JobRoles = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<JobRole[] | null>(null);

  const handleAnalyze = async () => {
    if (!file) return toast.error("Please upload your resume first");
    setLoading(true);
    setRoles(null);

    try {
      const parsed = await readResumeAsText(file);
      const { data, error } = await supabase.functions.invoke("suggest-roles", {
        body: parsed.base64
          ? { resumeBase64: parsed.base64 }
          : { resumeText: parsed.text },
      });

      if (error) {
        // Edge function returns 400 for non-resume documents
        const errorBody = typeof error === "object" && "message" in error ? error.message : String(error);
        throw new Error(errorBody);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setRoles(data.roles);
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      toast.error(error.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8 animate-fade-in">
          <span className="font-mono text-[11px] text-primary uppercase tracking-widest block mb-2">
            Module 01
          </span>
          <h1 className="text-3xl font-medium tracking-tight mb-2">
            Resume-Based Job Role Suggestions
          </h1>
          <p className="text-muted-foreground">
            Upload your resume and let AI suggest the best-matching job roles.
          </p>
        </div>

        {!roles && (
          <div className="space-y-6 animate-slide-up">
            <ResumeUpload
              onFileSelect={setFile}
              selectedFile={file}
              onClear={() => {
                setFile(null);
                setRoles(null);
              }}
            />

            <Button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full h-12 rounded-lg gap-2"
            >
              Suggest Job Roles
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

        {loading && <LoadingSpinner message="Validating resume and matching roles..." />}

        {roles && (
          <div className="mt-2 space-y-4 animate-fade-in">
            <h2 className="font-mono text-[11px] text-primary uppercase tracking-widest">
              Suggested Roles
            </h2>
            {roles.map((role, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                  i === 0 ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/20"
                }`}
              >
                <div
                  className={`size-8 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 ${
                    i === 0
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{role.title}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {role.matchPercentage}% match
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.keySkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-secondary text-[10px] font-mono rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 pt-6 border-t border-border mt-8">
              <Button
                onClick={() => {
                  setRoles(null);
                  setFile(null);
                }}
                variant="outline"
                className="gap-2"
              >
                Try Another Resume
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

export default JobRoles;
