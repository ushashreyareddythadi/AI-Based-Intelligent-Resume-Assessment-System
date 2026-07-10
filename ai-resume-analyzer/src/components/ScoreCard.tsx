import React from "react";

interface ScoreCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  description?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, value, suffix, description }) => (
  <div className="p-4 border border-border rounded-lg bg-card">
    <span className="font-mono text-[10px] text-muted-foreground block mb-1 uppercase tracking-widest">
      {label}
    </span>
    <span className="text-xl font-medium tabular-nums">
      {value}
      {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
    </span>
    {description && (
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    )}
  </div>
);

export default ScoreCard;
