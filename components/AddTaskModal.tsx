"use client";
import { useState, FormEvent } from "react";
import { Task, TaskType } from "@/types";
import { useMembers } from "@/hooks/useMembers";
import { X, CheckSquare, Calendar } from "lucide-react";

interface Props {
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void;
  onClose: () => void;
}

export default function AddTaskModal({ onAdd, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);
  const { members } = useMembers();

  const [type, setType] = useState<TaskType>("task");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(currentTime);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  const toggleMember = (id: string) => {
    setAssignedTo((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      type,
      completed: false,
      ...(type === "event" ? { date, time, assignedTo } : {}),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-6 pb-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">הוסף פריט</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => setType("task")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === "task" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            }`}
          >
            <CheckSquare size={16} />
            משימה
          </button>
          <button
            type="button"
            onClick={() => setType("event")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === "event" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
            }`}
          >
            <Calendar size={16} />
            אירוע
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 -mt-2">
          {type === "task"
            ? "משימה ללא מועד מוגדר — למשל: לקנות בגד ים"
            : "אירוע עם תאריך ושעה — ישתלב עם Google Calendar"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {type === "task" ? "שם המשימה" : "שם האירוע / חוג"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "task" ? "לדוגמה: לקנות בגד ים למילה" : "לדוגמה: כדורגל של דניאל"
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              autoFocus
              required
            />
          </div>

          {type === "event" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    תאריך
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    שעה
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    מי מוזמן?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => {
                      const selected = assignedTo.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleMember(member.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                            selected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              selected ? "bg-blue-500" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {member.name[0]}
                          </span>
                          {member.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {assignedTo.length === 0
                      ? "לא נבחר אף אחד — האירוע יסונכרן לכל הקלנדרים המחוברים"
                      : "האירוע יסונכרן רק לקלנדרים שנבחרו"}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-3.5 font-medium active:scale-95 transition-transform"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded-xl py-3.5 font-semibold active:bg-blue-700 active:scale-95 transition-all"
            >
              הוסף
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
