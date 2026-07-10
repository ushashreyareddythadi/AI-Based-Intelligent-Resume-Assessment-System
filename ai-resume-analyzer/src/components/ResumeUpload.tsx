import React, { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  selectedFile?: File | null;
  onClear?: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onFileSelect,
  acceptedTypes = ".pdf,.docx",
  selectedFile,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5"
          : selectedFile
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-secondary/50"
      }`}
    >
      {selectedFile ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="size-5 text-primary" />
          <span className="text-sm font-medium">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground">
            ({(selectedFile.size / 1024).toFixed(1)} KB)
          </span>
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="ml-2 p-1 rounded hover:bg-secondary transition-colors"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </div>
      ) : (
        <label className="cursor-pointer">
          <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">
            Drop your resume here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF and DOCX formats
          </p>
          <input
            type="file"
            accept={acceptedTypes}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
        </label>
      )}
    </div>
  );
};

export default ResumeUpload;
