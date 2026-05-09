"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { UploadCloud, FileText, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onSuccess?: (data: { resumeId: string; parsedData: unknown }) => void;
}

export function UploadZone({ onSuccess }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFile(file: File) {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      toast("Please upload a PDF or DOCX file.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast("File must be under 10 MB.", "error");
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setDone(false);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setDone(true);
      toast("Resume uploaded and profile extracted successfully!");
      onSuccess?.(data);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
      setDone(false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
        dragging
          ? "border-teal-500 bg-teal-50"
          : done
          ? "border-green-400 bg-green-50"
          : "border-gray-300 hover:border-navy-400 hover:bg-navy-50/30"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="text-teal-600 animate-spin" />
          <p className="text-sm font-medium text-gray-700">
            Uploading and extracting profile…
          </p>
          {fileName && <p className="text-xs text-gray-400">{fileName}</p>}
        </div>
      ) : done ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle size={40} className="text-green-500" />
          <p className="text-sm font-medium text-green-700">
            Profile extracted from {fileName}
          </p>
          <p className="text-xs text-gray-500">Click to upload another resume</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <UploadCloud size={40} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Drop your resume here, or{" "}
              <span className="text-teal-600">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF or DOCX · Max 10 MB</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileText size={12} />
            <span>AI will extract your profile automatically</span>
          </div>
        </div>
      )}
    </div>
  );
}
