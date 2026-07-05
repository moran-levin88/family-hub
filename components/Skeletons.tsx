export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-2.5 py-0.5">
          <div className="h-4 bg-slate-100 rounded-md w-2/3" />
          <div className="h-3 bg-slate-100 rounded-md w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ShoppingListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="bg-white rounded-2xl divide-y divide-slate-50 overflow-hidden shadow-sm border border-slate-100 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-4">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex-shrink-0" />
          <div className="h-4 bg-slate-100 rounded-md w-1/2" />
        </div>
      ))}
    </div>
  );
}
