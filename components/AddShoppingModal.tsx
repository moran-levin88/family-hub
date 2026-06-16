"use client";
import { useState, FormEvent } from "react";
import { ShoppingCategory, CATEGORY_LABELS, ShoppingItem } from "@/types";
import { X, AlertCircle } from "lucide-react";

interface Props {
  onAdd: (name: string, category: ShoppingCategory) => void;
  onClose: () => void;
  existingItems: ShoppingItem[];
}

export default function AddShoppingModal({ onAdd, onClose, existingItems }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("other");
  const [duplicate, setDuplicate] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    const isDup = existingItems.some(
      (i) => !i.purchased && i.name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    setDuplicate(isDup);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || duplicate) return;
    onAdd(name.trim(), category);
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
          <h2 className="text-xl font-bold text-slate-800">הוסף לקניות</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">שם המוצר</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="לדוגמה: חלב 3%"
              className={`w-full border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 text-base ${
                duplicate
                  ? "border-red-400 focus:ring-red-300"
                  : "border-slate-200 focus:ring-emerald-500"
              }`}
              autoFocus
              required
            />
            {duplicate && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs font-medium">
                <AlertCircle size={13} />
                הפריט כבר מופיע ברשימה
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">קטגוריה</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(CATEGORY_LABELS) as [ShoppingCategory, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border ${
                    category === key
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

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
              disabled={duplicate}
              className="flex-1 bg-emerald-500 text-white rounded-xl py-3.5 font-semibold active:bg-emerald-600 active:scale-95 transition-all disabled:opacity-40"
            >
              הוסף
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
