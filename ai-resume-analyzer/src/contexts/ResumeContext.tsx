import React, { createContext, useContext, useState, ReactNode } from "react";

interface ResumeContextType {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobRole: string;
  setJobRole: (role: string) => void;
  matchedSkills: string[];
  setMatchedSkills: (skills: string[]) => void;
  missingSkills: string[];
  setMissingSkills: (skills: string[]) => void;
  weakAreas: string[];
  setWeakAreas: (areas: string[]) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);

  return (
    <ResumeContext.Provider
      value={{
        resumeText, setResumeText,
        jobRole, setJobRole,
        matchedSkills, setMatchedSkills,
        missingSkills, setMissingSkills,
        weakAreas, setWeakAreas,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResumeContext = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResumeContext must be used within ResumeProvider");
  return ctx;
};
