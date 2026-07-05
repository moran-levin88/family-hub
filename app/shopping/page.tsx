"use client";
import { useState, FormEvent, useRef } from "react";
import { useShopping } from "@/hooks/useShopping";
import ShoppingItemRow from "@/components/ShoppingItemRow";
import { ShoppingListSkeleton } from "@/components/Skeletons";
import { ShoppingCategory, CATEGORY_LABELS } from "@/types";
import { detectCategory } from "@/lib/category-detector";
import { Plus, Trash2, ShoppingCart, ChevronRight, AlertCircle } from "lucide-react";

export default function ShoppingPage() {
  const { items, loaded, addItem, toggleItem, deleteItem, clearPurchased } = useShopping();
  const [inputName, setInputName] = useState("");
  const [duplicateError, setDuplicateError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_LABELS))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const isDup = items.some(
      (i) => !i.purchased && i.name.trim().toLowerCase() === inputName.trim().toLowerCase()
    );
    if (isDup) { setDuplicateError(true); return; }
    addItem(inputName.trim(), detectCategory(inputName.trim()));
    setInputName("");
    setDuplicateError(false);
    inputRef.current?.focus();
  };

  const pendingCount = items.filter((i) => !i.purchased).length;
  const purchasedItems = items.filter((i) => i.purchased);

  const validCategories = Object.keys(CATEGORY_LABELS) as ShoppingCategory[];
  const groupedPending = validCategories.reduce(
    (acc, cat) => {
      const catItems = items.filter((i) => {
        if (i.purchased) return false;
        if (cat === "other") return !validCategories.includes(i.category as ShoppingCategory) || i.category === "other";
        return i.category === cat;
      });
      if (catItems.length > 0) acc[cat] = catItems;
      return acc;
    },
    {} as Record<string, typeof items>
  );

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="px-4 pt-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingCart className="text-emerald-500" size={28} />
          רשימת קניות
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {pendingCount === 0
            ? loaded ? "כל הפריטים נרכשו! 🎉" : "טוען..."
            : `${pendingCount} פריטים לקניה`}
        </p>
      </div>

      {/* Quick add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputName}
            onChange={(e) => { setInputName(e.target.value); setDuplicateError(false); }}
            placeholder="הוסף מוצר..."
            className={`flex-1 border rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 text-base ${
              duplicateError ? "border-red-400 focus:ring-red-300" : "border-slate-200 focus:ring-emerald-500"
            }`}
          />
          <button
            type="submit"
            disabled={!inputName.trim()}
            className="bg-emerald-500 text-white rounded-xl px-4 py-3 active:bg-emerald-600 transition-colors disabled:opacity-40 active:scale-95"
          >
            <Plus size={22} />
          </button>
        </div>
        {duplicateError && (
          <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium">
            <AlertCircle size={13} />
            הפריט כבר מופיע ברשימה
          </div>
        )}
        {inputName.trim() && !duplicateError && (
          <p className="mt-2 text-xs text-slate-400">
            קטגוריה: <span className="text-slate-600 font-medium">{CATEGORY_LABELS[detectCategory(inputName)]}</span>
          </p>
        )}
      </form>

      {/* Loading skeleton */}
      {!loaded && <ShoppingListSkeleton count={5} />}

      {/* Empty state */}
      {loaded && Object.keys(groupedPending).length === 0 && purchasedItems.length === 0 && (
        <div className="text-center py-14 text-slate-400">
          <ShoppingCart size={52} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-slate-500">הרשימה ריקה</p>
          <p className="text-sm mt-1">הקלידו מוצר למעלה כדי להתחיל</p>
        </div>
      )}

      {/* Grouped pending items */}
      {Object.entries(groupedPending).map(([cat, catItems]) => (
        <div key={cat} className="mb-3">
          <button
            onClick={() => toggleCategoryExpand(cat)}
            className="flex items-center justify-between w-full mb-2 px-1"
          >
            <span className="text-sm font-semibold text-slate-600">
              {CATEGORY_LABELS[cat as ShoppingCategory]}
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                {catItems.length}
              </span>
              <ChevronRight
                size={16}
                className={`text-slate-400 transition-transform ${expandedCategories.has(cat) ? "rotate-90" : ""}`}
              />
            </div>
          </button>
          {expandedCategories.has(cat) && (
            <div className="bg-white rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm border border-slate-100">
              {catItems.map((item) => (
                <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Purchased items */}
      {purchasedItems.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-semibold text-slate-400">נרכשו ({purchasedItems.length})</span>
            <button
              onClick={clearPurchased}
              className="flex items-center gap-1 text-xs text-red-500 font-semibold py-1 px-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={13} />
              נקה רשימה
            </button>
          </div>
          <div className="bg-white rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm border border-slate-100 opacity-60">
            {purchasedItems.map((item) => (
              <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
