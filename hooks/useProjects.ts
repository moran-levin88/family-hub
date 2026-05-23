"use client";
import { useState, useEffect } from "react";
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Project, ProjectColor } from "@/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Project)));
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  const addProject = async (name: string, color: ProjectColor) => {
    await addDoc(collection(db, "projects"), {
      name,
      color,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteProject = async (id: string) => {
    await deleteDoc(doc(db, "projects", id));
  };

  return { projects, loaded, addProject, deleteProject };
}
