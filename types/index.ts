export type TaskType = "task" | "event";

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

export interface Member {
  id: string;
  name: string;
  createdAt: string;
  googleTokens?: GoogleTokens;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  date?: string;
  time?: string;
  endTime?: string;
  completed: boolean;
  createdAt: string;
  assignedTo?: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  purchased: boolean;
  createdAt: string;
}

export type ShoppingCategory = "supermarket" | "superpharm" | "clothing" | "other";

export const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  supermarket: "🛒 סופרמרקט",
  superpharm: "💊 סופרפארם",
  clothing: "👗 חנות בגדים",
  other: "📦 אחר",
};

export const CATEGORY_COLORS: Record<ShoppingCategory, string> = {
  supermarket: "bg-blue-100 text-blue-800",
  superpharm: "bg-teal-100 text-teal-800",
  clothing: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800",
};
