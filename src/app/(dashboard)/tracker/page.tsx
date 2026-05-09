"use client";

import { useEffect, useState } from "react";
import { KanbanBoard } from "@/components/tracker/kanban-board";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Plus, Kanban, Loader2 } from "lucide-react";

interface Application {
  id: string;
  jobTitle: string;
  companyName: string | null;
  status: string;
  fitScore: number | null;
  appliedAt: string | null;
  notes: string | null;
}

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    jobTitle: "",
    companyName: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/tracker")
      .then((r) => r.json())
      .then((data) => setApplications(data.applications ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd() {
    if (!form.jobTitle.trim()) {
      toast("Job title is required", "error");
      return;
    }
    setAdding(true);
    const res = await fetch("/api/tracker/add", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.application) {
      setApplications((prev) => [...prev, data.application]);
      setAddOpen(false);
      setForm({ jobTitle: "", companyName: "", notes: "" });
      toast("Application added to tracker");
    } else {
      toast("Failed to add application", "error");
    }
    setAdding(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
          <p className="text-gray-500 mt-1">
            Manage your applications from wishlist to offer
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus size={16} /> Add application
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Kanban size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No applications yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Add a job you&apos;re tracking or save one from the job board
          </p>
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus size={14} /> Add your first application
          </Button>
        </div>
      ) : (
        <KanbanBoard
          applications={applications.map((a) => ({
            ...a,
            appliedAt: a.appliedAt ? new Date(a.appliedAt) : null,
          }))}
        />
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Application"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Job title *"
            placeholder="e.g. Senior Software Engineer"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
          <Input
            label="Company"
            placeholder="e.g. Atlassian"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              placeholder="Any notes about this application…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              loading={adding}
              className="flex-1"
            >
              Add to tracker
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
