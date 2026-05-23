export type TaskType = "task" | "event";

export type ProjectColor = "blue" | "green" | "purple" | "orange" | "pink";

export interface Project {
  id: string;
  name: string;
  color: ProjectColor;
  createdAt: string;
}

export const PROJECT_COLORS: Record<ProjectColor, { bg: string; text: string; light: string }> = {
  blue:   { bg: "bg-blue-500",    text: "text-blue-600",    light: "bg-blue-50" },
  green:  { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
  purple: { bg: "bg-purple-500",  text: "text-purple-600",  light: "bg-purple-50" },
  orange: { bg: "bg-orange-500",  text: "text-orange-600",  light: "bg-orange-50" },
  pink:   { bg: "bg-pink-500",    text: "text-pink-600",    light: "bg-pink-50" },
};

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
  projectId?: string;
  calendarEventIds?: Record<string, string>;
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
