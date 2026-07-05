"use client";
import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const UNDO_WINDOW_MS = 5000;

async function syncEventToCalendars(task: {
  title: string;
  date?: string;
  time?: string;
  endTime?: string;
  assignedTo?: string[];
}): Promise<{ calendarEventIds: Record<string, string>; failed: string[] }> {
  const res = await fetch("/api/calendar/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: task.title,
      date: task.date,
      time: task.time,
      endTime: task.endTime,
      assignedTo: task.assignedTo ?? [],
    }),
  });
  const data = await res.json();
  const calendarEventIds: Record<string, string> = {};
  const failed: string[] = [];
  for (const r of data.synced ?? []) {
    if (r.success && r.eventId) calendarEventIds[r.memberId] = r.eventId;
    else if (!r.success) failed.push(r.member);
  }
  return { calendarEventIds, failed };
}

function deleteCalendarEvents(calendarEventIds: Record<string, string>) {
  fetch("/api/calendar/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ calendarEventIds }),
  }).catch(() => {});
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  const [lastDeleted, setLastDeleted] = useState<{ id: string; title: string } | null>(null);
  const deleteTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const tasksRef = useRef<Task[]>([]);

  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Task)
      );
      tasksRef.current = data;
      setTasks(data);
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  // אם עוזבים את העמוד באמצע חלון ה"ביטול" — מבצעים את המחיקות מיד
  useEffect(() => {
    const timeouts = deleteTimeouts.current;
    return () => {
      timeouts.forEach((timeout, id) => {
        clearTimeout(timeout);
        performDelete(id);
      });
      timeouts.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTasks = tasks.filter((t) => !pendingDeleteIds.has(t.id));

  const addTask = async (task: Omit<Task, "id" | "createdAt">): Promise<{ syncFailed?: string[] }> => {
    const createdBy = user?.displayName ?? user?.email ?? null;
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      ...(createdBy ? { createdBy } : {}),
      createdAt: new Date().toISOString(),
    });
    if (task.type === "event" && task.date && task.time) {
      try {
        const { calendarEventIds, failed } = await syncEventToCalendars(task);
        if (Object.keys(calendarEventIds).length > 0) {
          await updateDoc(doc(db, "tasks", docRef.id), { calendarEventIds });
        }
        if (failed.length > 0) return { syncFailed: failed };
      } catch {
        return { syncFailed: ["שגיאה בחיבור לגוגל"] };
      }
    }
    return {};
  };

  const updateTask = async (
    id: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>
  ): Promise<{ syncFailed?: string[] }> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return {};

    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) clean[k] = v;
    }

    const eventFieldsChanged =
      (updates.title !== undefined && updates.title !== task.title) ||
      (updates.date !== undefined && updates.date !== task.date) ||
      (updates.time !== undefined && updates.time !== task.time) ||
      (updates.endTime !== undefined && updates.endTime !== task.endTime) ||
      (updates.assignedTo !== undefined &&
        JSON.stringify(updates.assignedTo) !== JSON.stringify(task.assignedTo ?? []));
    const needsResync = task.type === "event" && eventFieldsChanged;
    const hadCalendarEvents =
      !!task.calendarEventIds && Object.keys(task.calendarEventIds).length > 0;

    if (needsResync && hadCalendarEvents) {
      deleteCalendarEvents(task.calendarEventIds!);
      clean.calendarEventIds = {};
    }

    await updateDoc(doc(db, "tasks", id), clean);

    if (needsResync) {
      const merged = { ...task, ...updates };
      if (merged.date && merged.time) {
        try {
          const { calendarEventIds, failed } = await syncEventToCalendars(merged);
          if (Object.keys(calendarEventIds).length > 0) {
            await updateDoc(doc(db, "tasks", id), { calendarEventIds });
          }
          if (failed.length > 0) return { syncFailed: failed };
        } catch {
          return { syncFailed: ["שגיאה בחיבור לגוגל"] };
        }
      }
    }
    return {};
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await updateDoc(doc(db, "tasks", id), { completed: !task.completed });
  };

  const performDelete = (id: string) => {
    deleteTimeouts.current.delete(id);
    const task = tasksRef.current.find((t) => t.id === id);
    if (task?.type === "event" && task.calendarEventIds && Object.keys(task.calendarEventIds).length > 0) {
      deleteCalendarEvents(task.calendarEventIds);
    }
    deleteDoc(doc(db, "tasks", id)).catch(() => {});
  };

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || deleteTimeouts.current.has(id)) return;
    setPendingDeleteIds((prev) => new Set(prev).add(id));
    setLastDeleted({ id, title: task.title });
    const timeout = setTimeout(() => {
      performDelete(id);
      setPendingDeleteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setLastDeleted((cur) => (cur?.id === id ? null : cur));
    }, UNDO_WINDOW_MS);
    deleteTimeouts.current.set(id, timeout);
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    const timeout = deleteTimeouts.current.get(lastDeleted.id);
    if (timeout) clearTimeout(timeout);
    deleteTimeouts.current.delete(lastDeleted.id);
    const id = lastDeleted.id;
    setPendingDeleteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLastDeleted(null);
  };

  const getUpcomingEvents = (count: number): Task[] => {
    const now = new Date();
    return visibleTasks
      .filter(
        (t) =>
          !t.completed &&
          t.type === "event" &&
          t.date &&
          t.time &&
          new Date(`${t.date}T${t.time}:00`) >= now
      )
      .sort(
        (a, b) =>
          new Date(`${a.date!}T${a.time!}:00`).getTime() -
          new Date(`${b.date!}T${b.time!}:00`).getTime()
      )
      .slice(0, count);
  };

  const getOverdueEvents = (): Task[] => {
    const now = new Date();
    return visibleTasks
      .filter(
        (t) =>
          !t.completed &&
          t.type === "event" &&
          t.date &&
          t.time &&
          new Date(`${t.date}T${t.time}:00`) < now
      )
      .sort(
        (a, b) =>
          new Date(`${a.date!}T${a.time!}:00`).getTime() -
          new Date(`${b.date!}T${b.time!}:00`).getTime()
      );
  };

  const getPendingTasks = (): Task[] =>
    visibleTasks.filter((t) => !t.completed && t.type === "task");

  return {
    tasks: visibleTasks,
    loaded,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    undoDelete,
    lastDeleted,
    getUpcomingEvents,
    getOverdueEvents,
    getPendingTasks,
  };
}
