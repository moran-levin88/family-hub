"use client";
import { useState, FormEvent } from "react";
import { ProjectColor, PROJECT_COLORS } from "@/types";
import { X } from "lucide-react";

interface Props {
  onAdd: (name: string, color: ProjectColor) => void;
  onClose: () => void;
}

const COLORS: ProjectColor[] = ["blue", "green", "purple", "orange", "pink"];

export default function AddProjectModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<ProjectColor>("blue");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-6 pb-10 animate-slide-up">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">פרויקט חדש</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">שם הפרויקט</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: שיפוץ הבית"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">צבע</label>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full ${PROJECT_COLORS[c].bg} transition-transform active:scale-95 ${
                    color === c ? "ring-4 ring-offset-2 ring-slate-400 scale-110" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
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
              צור פרויקט
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
