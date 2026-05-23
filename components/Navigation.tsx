"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, CalendarDays, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "בית", icon: Home },
  { href: "/shopping", label: "קניות", icon: ShoppingCart },
  { href: "/tasks", label: "משימות", icon: CalendarDays },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[100]"
         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-8 py-2 rounded-xl transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
