"use client";
import { useRef, useState, TouchEvent } from "react";
import { ShoppingItem } from "@/types";
import { Check, Trash2 } from "lucide-react";

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const DELETE_THRESHOLD = -72;
const MAX_DRAG = -96;

export default function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
}: ShoppingItemRowProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const isHorizontal = useRef(false);

  const handleTouchStart = (e: TouchEvent) => {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isHorizontal.current = false;
    setDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!start.current) return;
    const dx = e.touches[0].clientX - start.current.x;
    const dy = e.touches[0].clientY - start.current.y;
    if (!isHorizontal.current) {
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dx) < Math.abs(dy)) {
        // גלילה אנכית — לא חוטפים את המחווה
        start.current = null;
        setDragging(false);
        return;
      }
      isHorizontal.current = true;
    }
    setDragX(Math.min(0, Math.max(MAX_DRAG, dx)));
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (start.current && dragX < DELETE_THRESHOLD) {
      onDelete(item.id);
    }
    setDragX(0);
    start.current = null;
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center">
        <Trash2 size={18} className="text-white" />
      </div>
      <div
        className={`relative flex items-center gap-3 py-3 px-4 bg-white ${
          dragging ? "" : "transition-transform duration-200"
        }`}
        style={{ transform: `translateX(${dragX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => onToggle(item.id)}
          className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all active:scale-95 ${
            item.purchased
              ? "bg-emerald-500 border-emerald-500"
              : "border-slate-300 hover:border-emerald-400"
          }`}
        >
          {item.purchased && <Check size={14} color="white" strokeWidth={3} />}
        </button>

        <span
          className={`flex-1 font-medium text-base ${
            item.purchased ? "line-through text-slate-400" : "text-slate-800"
          }`}
        >
          {item.name}
        </span>

        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
