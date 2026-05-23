"use client";
import { Task } from "@/types";
import { Check, Trash2, Calendar, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatTaskDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  if (dateStr === todayStr) return "היום";
  if (dateStr === tomorrowStr) return "מחר";
  return date.toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function buildGCalUrl(task: Task & { date: string; time: string }): string {
  const pad = (s: string) => s.replace(/[-:]/g, "");
  const startStr = `${task.date}T${task.time}:00`.replace(/[-:]/g, "").replace("T", "T");
  const endTime = task.endTime ?? (() => {
    const [h, m] = task.time.split(":").map(Number);
    return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();
  const endStr = `${task.date}T${endTime}:00`.replace(/[-:]/g, "");
  const fmtStart = pad(task.date) + "T" + pad(task.time) + "00";
  const fmtEnd = pad(task.date) + "T" + pad(endTime) + "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    dates: `${fmtStart}/${fmtEnd}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
        task.completed
          ? "border-slate-100 opacity-60"
          : "border-blue-100 hover:border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            task.completed
              ? "bg-blue-500 border-blue-500"
              : "border-slate-300 hover:border-blue-400"
          }`}
        >
          {task.completed && <Check size={14} color="white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`font-semibold text-slate-800 leading-tight ${
                task.completed ? "line-through text-slate-400" : ""
              }`}
            >
              {task.title}
            </p>
            {task.type === "task" && (
              <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">
                משימה
              </span>
            )}
          </div>
          {task.type === "event" && task.date && task.time && (
            <>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={11} />
                  {formatTaskDate(task.date)}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={11} />
                  {task.time}{task.endTime ? `–${task.endTime}` : ""}
                </span>
              </div>
              {!task.completed && (
                <a
                  href={buildGCalUrl(task as Task & { date: string; time: string })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded-lg"
                >
                  <Calendar size={11} />
                  הוסף ליומן Google
                </a>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
