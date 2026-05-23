"use client";
import { useState, useEffect } from "react";
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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Task)
      );
      setTasks(data);
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: new Date().toISOString(),
    });
    if (task.type === "event" && task.date && task.time) {
      try {
        const res = await fetch("/api/calendar/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: task.title, date: task.date, time: task.time, endTime: task.endTime, assignedTo: task.assignedTo ?? [] }),
        });
        const data = await res.json();
        const calendarEventIds: Record<string, string> = {};
        for (const r of data.synced ?? []) {
          if (r.success && r.eventId) calendarEventIds[r.memberId] = r.eventId;
        }
        if (Object.keys(calendarEventIds).length > 0) {
          await updateDoc(doc(db, "tasks", docRef.id), { calendarEventIds });
        }
      } catch {}
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await updateDoc(doc(db, "tasks", id), { completed: !task.completed });
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.type === "event" && task.calendarEventIds && Object.keys(task.calendarEventIds).length > 0) {
      fetch("/api/calendar/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarEventIds: task.calendarEventIds }),
      }).catch(() => {});
    }
    await deleteDoc(doc(db, "tasks", id));
  };

  const getUpcomingEvents = (count: number): Task[] => {
    const now = new Date();
    return tasks
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

  const getPendingTasks = (): Task[] =>
    tasks.filter((t) => !t.completed && t.type === "task");

  return { tasks, loaded, addTask, toggleTask, deleteTask, getUpcomingEvents, getPendingTasks };
}
