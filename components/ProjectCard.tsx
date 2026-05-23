"use client";
import Link from "next/link";
import { Project, Task, PROJECT_COLORS } from "@/types";
import { ChevronLeft, Trash2 } from "lucide-react";

interface Props {
  project: Project;
  tasks: Task[];
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, tasks, onDelete }: Props) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const colors = PROJECT_COLORS[project.color];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <Link href={`/tasks/${project.id}`} className="block p-4 active:bg-slate-50 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
            <span className="font-semibold text-slate-800">{project.name}</span>
          </div>
          <ChevronLeft size={18} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>{done}/{total} משימות הושלמו</span>
          <span className={`font-semibold ${colors.text}`}>{progress}%</span>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colors.bg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </Link>

      <div className={`border-t border-slate-50 px-4 py-2 flex justify-end ${colors.light}`}>
        <button
          onClick={() => onDelete(project.id)}
          className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
