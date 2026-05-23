"use client";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Member } from "@/types";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "members"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Member)));
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  const addMember = async (name: string) => {
    await addDoc(collection(db, "members"), {
      name,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteMember = async (id: string) => {
    await deleteDoc(doc(db, "members", id));
  };

  return { members, loaded, addMember, deleteMember };
}
