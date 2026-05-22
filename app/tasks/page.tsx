"use client";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import { CalendarDays, Plus, CheckCircle2, CheckSquare } from "lucide-react";

type FilterType = "all" | "tasks" | "events";

export default function TasksPage() {
  const { tasks, loaded, toggleTask, deleteTask, addTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const pendingTasks = tasks.filter((t) => !t.completed && t.type === "task");
  const completedTasks = tasks.filter((t) => t.completed && t.type === "task");

  const upcomingEvents = tasks
    .filter((t) => !t.completed && t.type === "event")
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}:00`).getTime() -
        new Date(`${b.date}T${b.time}:00`).getTime()
    );

  const completedEvents = tasks.filter((t) => t.completed && t.type === "event");

  // Group events by date
  const groupedEvents: Record<string, typeof tasks> = {};
  upcomingEvents.forEach((task) => {
    const key = task.date!;
    if (!groupedEvents[key]) groupedEvents[key] = [];
    groupedEvents[key].push(task);
  });

  const formatGroupDate = (dateStr: string): string => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    if (dateStr === today) return "היום";
    if (dateStr === tomorrow) return "מחר";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const showTasks = filter === "all" || filter === "tasks";
  const showEvents = filter === "all" || filter === "events";

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="text-blue-600" size={28} />
          משימות ואירועים
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm shadow-md shadow-blue-200 active:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={18} />
          הוסף
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-5 shadow-sm border border-slate-100">
        {(["all", "tasks", "events"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f === "all" ? "הכל" : f === "tasks" ? "✅ משימות" : "📅 אירועים"}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {loaded &&
        tasks.filter((t) => !t.completed).length === 0 && (
          <div className="text-center py-14 text-slate-400">
            <CheckCircle2 size={52} className="mx-auto mb-3 opacity-25" />
            <p className="font-semibold text-slate-500">אין פריטים פעילים</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-200"
            >
              הוסף ראשון
            </button>
          </div>
        )}

      {/* Tasks section (no date) */}
      {showTasks && pendingTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2 px-1">
            <CheckSquare size={15} className="text-slate-500" />
            <span className="text-sm font-bold text-slate-600">משימות לביצוע</span>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">{pendingTasks.length}</span>
          </div>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>
      )}

      {/* Events section (with date) */}
      {showEvents &&
        Object.entries(groupedEvents).map(([date, dateTasks]) => (
          <div key={date} className="mb-5">
            <div className="flex items-center gap-3 mb-2 px-1">
              <CalendarDays size={15} className="text-blue-500" />
              <span className="text-sm font-bold text-slate-600">{formatGroupDate(date)}</span>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">{dateTasks.length}</span>
            </div>
            <div className="space-y-2">
              {dateTasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
              ))}
            </div>
          </div>
        ))}

      {/* Completed */}
      {filter !== "all" && (completedTasks.length > 0 || completedEvents.length > 0) && (
        <div className="mt-2 opacity-50">
          <div className="flex items-center gap-3 mb-2 px-1">
            <span className="text-sm font-bold text-slate-400">הושלמו</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="space-y-2">
            {(filter === "tasks" ? completedTasks : completedEvents).map((task) => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />

      {showModal && (
        <AddTaskModal onAdd={addTask} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
