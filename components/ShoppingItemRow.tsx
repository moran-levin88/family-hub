"use client";
import { ShoppingItem } from "@/types";
import { Check, Trash2 } from "lucide-react";

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
}: ShoppingItemRowProps) {
  return (
    <div className={`flex items-center gap-3 py-3 px-4 transition-all`}>
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
  );
}
