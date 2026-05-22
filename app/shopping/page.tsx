"use client";
import { useState, FormEvent, useRef } from "react";
import { useShopping } from "@/hooks/useShopping";
import ShoppingItemRow from "@/components/ShoppingItemRow";
import { ShoppingCategory, CATEGORY_LABELS } from "@/types";
import { Plus, Trash2, ShoppingCart, ChevronDown, ChevronRight } from "lucide-react";

export default function ShoppingPage() {
  const { items, loaded, addItem, toggleItem, deleteItem, clearPurchased } = useShopping();
  const [inputName, setInputName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory>("other");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_LABELS))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    addItem(inputName.trim(), selectedCategory);
    setInputName("");
    inputRef.current?.focus();
  };

  const pendingCount = items.filter((i) => !i.purchased).length;
  const purchasedItems = items.filter((i) => i.purchased);

  const groupedPending = (Object.keys(CATEGORY_LABELS) as ShoppingCategory[]).reduce(
    (acc, cat) => {
      const catItems = items.filter((i) => i.category === cat && !i.purchased);
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
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingCart className="text-emerald-500" size={28} />
          רשימת קניות
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {pendingCount === 0
            ? loaded
              ? "כל הפריטים נרכשו! 🎉"
              : "טוען..."
            : `${pendingCount} פריטים לקניה`}
        </p>
      </div>

      {/* Quick add form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="הוסף מוצר..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
          />
          <button
            type="submit"
            disabled={!inputName.trim()}
            className="bg-emerald-500 text-white rounded-xl px-4 py-3 active:bg-emerald-600 transition-colors disabled:opacity-40 active:scale-95"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Category picker toggle */}
        <button
          type="button"
          onClick={() => setShowCategoryPicker(!showCategoryPicker)}
          className="flex items-center gap-1 mt-3 text-sm text-slate-500"
        >
          קטגוריה:{" "}
          <span className="text-slate-700 font-medium">
            {CATEGORY_LABELS[selectedCategory]}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform text-slate-400 ${
              showCategoryPicker ? "rotate-180" : ""
            }`}
          />
        </button>

        {showCategoryPicker && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(Object.entries(CATEGORY_LABELS) as [ShoppingCategory, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(key);
                    setShowCategoryPicker(false);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border ${
                    selectedCategory === key
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        )}
      </form>

      {/* Empty state */}
      {loaded &&
        Object.keys(groupedPending).length === 0 &&
        purchasedItems.length === 0 && (
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
                className={`text-slate-400 transition-transform ${
                  expandedCategories.has(cat) ? "rotate-90" : ""
                }`}
              />
            </div>
          </button>

          {expandedCategories.has(cat) && (
            <div className="bg-white rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm border border-slate-100">
              {catItems.map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Purchased items */}
      {purchasedItems.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-semibold text-slate-400">
              נרכשו ({purchasedItems.length})
            </span>
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
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
