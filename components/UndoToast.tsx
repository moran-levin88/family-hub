"use client";
import { Undo2 } from "lucide-react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
}

export default function UndoToast({ message, onUndo }: UndoToastProps) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-[150] max-w-lg mx-auto pointer-events-none">
      <div className="bg-slate-800 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl animate-slide-up pointer-events-auto">
        <span className="text-sm font-medium truncate ml-3">{message}</span>
        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 text-blue-300 text-sm font-bold px-3 py-1.5 rounded-xl active:bg-slate-700 transition-colors flex-shrink-0"
        >
          <Undo2 size={15} />
          ביטול
        </button>
      </div>
    </div>
  );
}
