"use client";

import { useState } from "react";
import { KANBAN_COLUMNS } from "@/lib/utils";
import { updateApplicationStatus, deleteApplication } from "@/server/actions/tracker";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Trash2, Building2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Application {
  id: string;
  jobTitle: string;
  companyName: string | null;
  status: string;
  fitScore: number | null;
  appliedAt: Date | null;
  notes: string | null;
}

interface KanbanBoardProps {
  applications: Application[];
}

export function KanbanBoard({ applications: initial }: KanbanBoardProps) {
  const [apps, setApps] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const { toast } = useToast();

  async function moveTo(appId: string, status: string) {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
    const result = await updateApplicationStatus(appId, status);
    if ("error" in result) {
      toast("Failed to update status", "error");
    }
  }

  async function remove(appId: string) {
    setApps((prev) => prev.filter((a) => a.id !== appId));
    await deleteApplication(appId);
    toast("Application removed");
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
      {KANBAN_COLUMNS.map((col) => {
        const colApps = apps.filter((a) => a.status === col.id);

        return (
          <div
            key={col.id}
            className={cn(
              "flex-shrink-0 w-60 rounded-xl border border-gray-200",
              dragOver === col.id && "border-teal-400 bg-teal-50/50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(col.id);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging) moveTo(dragging, col.id);
              setDragging(null);
              setDragOver(null);
            }}
          >
            {/* Column header */}
            <div className={cn("px-3 py-2.5 rounded-t-xl border-b border-gray-200", col.color)}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="text-xs bg-white/70 rounded-full px-1.5 py-0.5 font-medium text-gray-600">
                  {colApps.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[200px]">
              {colApps.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-300">
                  No applications
                </div>
              )}
              {colApps.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => setDragging(app.id)}
                  onDragEnd={() => setDragging(null)}
                  className={cn(
                    "bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing",
                    "hover:border-teal-300 hover:shadow-sm transition-all",
                    dragging === app.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <GripVertical size={12} className="text-gray-300 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {app.jobTitle}
                      </p>
                      {app.companyName && (
                        <p className="text-xs text-gray-500 flex items-center gap-0.5 mt-0.5">
                          <Building2 size={9} />
                          {app.companyName}
                        </p>
                      )}
                      {app.fitScore !== null && (
                        <div className="mt-1.5">
                          <Badge
                            variant={
                              app.fitScore >= 80
                                ? "green"
                                : app.fitScore >= 60
                                ? "amber"
                                : "default"
                            }
                          >
                            {app.fitScore}% match
                          </Badge>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => remove(app.id)}
                      className="p-0.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Quick move */}
                  <div className="mt-2 pt-2 border-t border-gray-50">
                    <select
                      value={app.status}
                      onChange={(e) => moveTo(app.id, e.target.value)}
                      className="w-full text-xs py-1 px-1.5 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {KANBAN_COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
