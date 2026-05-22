export type TaskType = "task" | "event";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  date?: string;
  time?: string;
  completed: boolean;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  purchased: boolean;
  createdAt: string;
}

export type ShoppingCategory =
  | "vegetables"
  | "dairy"
  | "meat"
  | "bakery"
  | "canned"
  | "cleaning"
  | "other";

export const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  vegetables: "🥦 ירקות ופירות",
  dairy: "🥛 מוצרי חלב",
  meat: "🥩 בשר ודגים",
  bakery: "🥖 מאפים",
  canned: "🥫 שימורים ויבשים",
  cleaning: "🧹 ניקיון",
  other: "📦 אחר",
};

export const CATEGORY_COLORS: Record<ShoppingCategory, string> = {
  vegetables: "bg-green-100 text-green-800",
  dairy: "bg-blue-100 text-blue-800",
  meat: "bg-red-100 text-red-800",
  bakery: "bg-yellow-100 text-yellow-800",
  canned: "bg-orange-100 text-orange-800",
  cleaning: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800",
};
