"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { UploadCloud, FileText, CheckCircle, Loader2, Download } from "lucide-react";

const TEMPLATE_HEADERS =
  "title,company,location,state,workType,employmentType,salaryMin,salaryMax,description,requirements,responsibilities,skills,industry,experienceLevel,visaSponsorship,workRights,isFeatured";

const EXAMPLE_ROW =
  'Senior Frontend Developer,Canva,Sydney,NSW,hybrid,full-time,130000,160000,"Build world-class React components for millions of users","3+ years React|TypeScript proficiency|Strong CSS skills","Design and build UI components|Collaborate with product teams|Write unit tests","React,TypeScript,CSS,Figma",Technology,senior,false,"Australian Citizen,Permanent Resident",true';

export default function AdminImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    total: number;
  } | null>(null);
  const { toast } = useToast();

  function downloadTemplate() {
    const content = `${TEMPLATE_HEADERS}\n${EXAMPLE_ROW}`;
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aupath-jobs-template.csv";
    a.click();
  }

  async function handleImport() {
    if (!file) return;
    setUploading(true);
    setResult(null);

    const fd = new FormData();
    fd.append("csv", file);

    const res = await fetch("/api/jobs/import", { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok) {
      setResult(data);
      toast(`Imported ${data.created} jobs successfully`);
    } else {
      toast(data.error ?? "Import failed", "error");
    }
    setUploading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CSV Job Importer</h1>
        <p className="text-gray-500 mt-1">
          Import job listings in bulk from a CSV file
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">CSV Format</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
            <code className="text-xs text-gray-600 whitespace-nowrap">
              {TEMPLATE_HEADERS}
            </code>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              <strong>workType:</strong> on-site | hybrid | remote
            </p>
            <p>
              <strong>employmentType:</strong> full-time | part-time | contract | casual
            </p>
            <p>
              <strong>experienceLevel:</strong> graduate | junior | mid | senior | lead
            </p>
            <p>
              <strong>requirements/responsibilities:</strong> use | as separator
            </p>
            <p>
              <strong>skills/workRights:</strong> use , as separator
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download size={14} /> Download template CSV
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Upload CSV</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-navy-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={32} className="text-teal-500" />
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400">Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud size={32} className="text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to select a CSV file
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-green-500" />
                <p className="font-semibold text-green-700">Import complete</p>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>Total rows: {result.total}</p>
                <p>Created: {result.created}</p>
                <p>Skipped: {result.skipped}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file}
            loading={uploading}
            size="md"
          >
            {uploading ? "Importing…" : "Import jobs"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
