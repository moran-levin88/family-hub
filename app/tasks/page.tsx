"use client";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import TaskCard from "@/components/TaskCard";
import ProjectCard from "@/components/ProjectCard";
import AddTaskModal from "@/components/AddTaskModal";
import AddProjectModal from "@/components/AddProjectModal";
import { CalendarDays, Plus, CheckCircle2, CheckSquare, FolderOpen } from "lucide-react";

type FilterType = "all" | "tasks" | "events" | "projects";

export default function TasksPage() {
  const { tasks, loaded, toggleTask, deleteTask, addTask } = useTasks();
  const { projects, addProject, deleteProject } = useProjects();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const standaloneTasks = tasks.filter((t) => !t.projectId);
  const pendingTasks = standaloneTasks.filter((t) => !t.completed && t.type === "task");
  const completedTasks = standaloneTasks.filter((t) => t.completed && t.type === "task");

  const upcomingEvents = standaloneTasks
    .filter((t) => !t.completed && t.type === "event")
    .sort((a, b) =>
      new Date(`${a.date}T${a.time}:00`).getTime() -
      new Date(`${b.date}T${b.time}:00`).getTime()
    );
  const completedEvents = standaloneTasks.filter((t) => t.completed && t.type === "event");

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
    return new Date(dateStr + "T00:00:00").toLocaleDateString("he-IL", {
      weekday: "long", day: "numeric", month: "long",
    });
  };

  const showTasks = filter === "all" || filter === "tasks";
  const showEvents = filter === "all" || filter === "events";
  const showProjects = filter === "all" || filter === "projects";

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarDays className="text-blue-600" size={28} />
          משימות ואירועים
        </h1>
        <button
          onClick={() => filter === "projects" ? setShowProjectModal(true) : setShowTaskModal(true)}
          className="bg-blue-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 font-semibold text-sm shadow-md shadow-blue-200 active:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={18} />
          {filter === "projects" ? "פרויקט" : "הוסף"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-5 shadow-sm border border-slate-100">
        {([
          { key: "all", label: "הכל" },
          { key: "tasks", label: "✅ משימות" },
          { key: "events", label: "📅 אירועים" },
          { key: "projects", label: "📁 פרויקטים" },
        ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {loaded && tasks.filter((t) => !t.completed).length === 0 && projects.length === 0 && (
        <div className="text-center py-14 text-slate-400">
          <CheckCircle2 size={52} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-slate-500">אין פריטים פעילים</p>
          <button
            onClick={() => setShowTaskModal(true)}
            className="mt-3 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-200"
          >
            הוסף ראשון
          </button>
        </div>
      )}

      {/* Projects section */}
      {showProjects && projects.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2 px-1">
            <FolderOpen size={15} className="text-slate-500" />
            <span className="text-sm font-bold text-slate-600">פרויקטים</span>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">{projects.length}</span>
          </div>
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={tasks.filter((t) => t.projectId === project.id)}
                onDelete={deleteProject}
              />
            ))}
          </div>
          {filter === "projects" && (
            <button
              onClick={() => setShowProjectModal(true)}
              className="mt-3 w-full border-2 border-dashed border-slate-200 rounded-2xl py-4 text-sm text-slate-400 font-medium flex items-center justify-center gap-2 active:bg-slate-50 transition-colors"
            >
              <Plus size={16} />
              פרויקט חדש
            </button>
          )}
        </div>
      )}

      {filter === "projects" && projects.length === 0 && (
        <div className="text-center py-14 text-slate-400">
          <FolderOpen size={52} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-slate-500">אין פרויקטים עדיין</p>
          <button
            onClick={() => setShowProjectModal(true)}
            className="mt-3 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-200"
          >
            צור פרויקט ראשון
          </button>
        </div>
      )}

      {/* Tasks section */}
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

      {/* Events section */}
      {showEvents && Object.entries(groupedEvents).map(([date, dateTasks]) => (
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
      {filter !== "all" && filter !== "projects" && (completedTasks.length > 0 || completedEvents.length > 0) && (
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

      {showTaskModal && <AddTaskModal onAdd={addTask} onClose={() => setShowTaskModal(false)} />}
      {showProjectModal && (
        <AddProjectModal onAdd={addProject} onClose={() => setShowProjectModal(false)} />
      )}
    </div>
  );
}
