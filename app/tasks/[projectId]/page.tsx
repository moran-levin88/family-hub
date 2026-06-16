"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import { PROJECT_COLORS } from "@/types";
import { ArrowRight, Plus, CheckCircle2, Trash2 } from "lucide-react";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { tasks, toggleTask, deleteTask, addTask } = useTasks();
  const { projects, deleteProject } = useProjects();
  const [showModal, setShowModal] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const pending = projectTasks.filter((t) => !t.completed);
  const completed = projectTasks.filter((t) => t.completed);
  const progress = projectTasks.length === 0 ? 0 : Math.round((completed.length / projectTasks.length) * 100);

  const colors = project ? PROJECT_COLORS[project.color] : PROJECT_COLORS.blue;

  const handleAddTask = (task: Parameters<typeof addTask>[0]) => {
    return addTask({ ...task, projectId });
  };

  const handleDeleteProject = async () => {
    await deleteProject(projectId);
    router.push("/tasks");
  };

  if (!project) {
    return (
      <div className="px-4 pt-6 text-center text-slate-400 py-20">
        <p>הפרויקט לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 active:scale-95 transition-transform"
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shrink-0 ${colors.bg}`} />
            <h1 className="text-xl font-bold text-slate-800 truncate">{project.name}</h1>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 mr-5">
            {completed.length}/{projectTasks.length} משימות הושלמו
          </p>
        </div>
        <button
          onClick={handleDeleteProject}
          className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colors.bg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-400">התקדמות</span>
          <span className={`text-xs font-semibold ${colors.text}`}>{progress}%</span>
        </div>
      </div>

      {/* Add task button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full mb-5 bg-white border-2 border-dashed border-slate-200 rounded-2xl py-3.5 text-sm text-slate-400 font-medium flex items-center justify-center gap-2 active:bg-slate-50 transition-colors"
      >
        <Plus size={16} />
        הוסף משימה לפרויקט
      </button>

      {/* Empty state */}
      {projectTasks.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <CheckCircle2 size={44} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium text-slate-500">אין משימות עדיין</p>
        </div>
      )}

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="mb-5 space-y-2">
          {pending.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div className="opacity-50">
          <div className="flex items-center gap-3 mb-2 px-1">
            <span className="text-sm font-bold text-slate-400">הושלמו ({completed.length})</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="space-y-2">
            {completed.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />

      {showModal && (
        <AddTaskModal onAdd={handleAddTask} onClose={() => setShowModal(false)} taskOnly />
      )}
    </div>
  );
}
