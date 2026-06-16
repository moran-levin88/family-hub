"use client";
import { useState } from "react";
import Link from "next/link";
import { useTasks } from "@/hooks/useTasks";
import { useShopping } from "@/hooks/useShopping";
import TaskCard from "@/components/TaskCard";
import ShoppingItemRow from "@/components/ShoppingItemRow";
import AddTaskModal from "@/components/AddTaskModal";
import AddShoppingModal from "@/components/AddShoppingModal";
import { Plus, ShoppingCart, CalendarDays, ChevronLeft } from "lucide-react";

export default function DashboardPage() {
  const { tasks, toggleTask, deleteTask, addTask, getUpcomingEvents, getPendingTasks } = useTasks();
  const { items, toggleItem, deleteItem, addItem, getPendingCount } = useShopping();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);

  const upcomingEvents = getUpcomingEvents(3);
  const pendingTasks = getPendingTasks();
  const pendingItems = items.filter((i) => !i.purchased).slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "לילה טוב" : hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  const dateLabel = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{greeting} 👋</h1>
            <p className="text-slate-500 text-sm mt-0.5">{dateLabel}</p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-blue-200">
            🏠
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
          <p className="text-blue-200 text-xs font-medium">אירועים קרובים</p>
          <p className="text-4xl font-bold mt-1 leading-none">{upcomingEvents.length}</p>
          <p className="text-blue-200 text-xs mt-2">{pendingTasks.length} משימות פתוחות</p>
        </div>
        <div className="bg-emerald-500 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200">
          <p className="text-emerald-100 text-xs font-medium">רשימת קניות</p>
          <p className="text-4xl font-bold mt-1 leading-none">{getPendingCount()}</p>
          <p className="text-emerald-100 text-xs mt-2">פריטים לקניה</p>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-3 mb-7">
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex-1 bg-white border border-blue-200 text-blue-600 rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm active:scale-95 transition-transform"
        >
          <Plus size={18} />
          משימה חדשה
        </button>
        <button
          onClick={() => setShowShoppingModal(true)}
          className="flex-1 bg-white border border-emerald-200 text-emerald-600 rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold text-sm shadow-sm active:scale-95 transition-transform"
        >
          <Plus size={18} />
          פריט לקניה
        </button>
      </div>

      {/* Pending tasks (no date) */}
      {pendingTasks.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              ✅ משימות לביצוע
            </h2>
            <Link href="/tasks" className="text-blue-600 text-sm font-medium flex items-center gap-0.5">
              הכל <ChevronLeft size={15} />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming events (with date) */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <CalendarDays size={20} className="text-blue-600" />
            אירועים קרובים
          </h2>
          <Link
            href="/tasks"
            className="text-blue-600 text-sm font-medium flex items-center gap-0.5"
          >
            הכל
            <ChevronLeft size={15} />
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            <CalendarDays size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">אין אירועים קרובים</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="mt-2 text-blue-600 text-xs font-semibold"
            >
              הוסף עכשיו
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </section>

      {/* Shopping preview */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-500" />
            לקניה
          </h2>
          <Link
            href="/shopping"
            className="text-blue-600 text-sm font-medium flex items-center gap-0.5"
          >
            הכל
            <ChevronLeft size={15} />
          </Link>
        </div>

        {pendingItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
            <ShoppingCart size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">הרשימה ריקה</p>
            <button
              onClick={() => setShowShoppingModal(true)}
              className="mt-2 text-emerald-600 text-xs font-semibold"
            >
              הוסף מוצר
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm border border-slate-100">
            {pendingItems.map((item) => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
              />
            ))}
            {items.filter((i) => !i.purchased).length > 5 && (
              <Link
                href="/shopping"
                className="block text-center py-3 text-sm text-blue-600 font-medium"
              >
                +{items.filter((i) => !i.purchased).length - 5} עוד פריטים
              </Link>
            )}
          </div>
        )}
      </section>

      <div className="h-4" />

      {showTaskModal && (
        <AddTaskModal onAdd={addTask} onClose={() => setShowTaskModal(false)} />
      )}
      {showShoppingModal && (
        <AddShoppingModal
          onAdd={addItem}
          onClose={() => setShowShoppingModal(false)}
          existingItems={items}
        />
      )}
    </div>
  );
}
