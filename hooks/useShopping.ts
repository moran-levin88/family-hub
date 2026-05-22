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
  writeBatch,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShoppingItem, ShoppingCategory } from "@/types";

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "shopping_items"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as ShoppingItem)
      );
      setItems(data);
      setLoaded(true);
    });
    return unsubscribe;
  }, []);

  const addItem = async (
    name: string,
    category: ShoppingCategory = "other"
  ) => {
    await addDoc(collection(db, "shopping_items"), {
      name: name.trim(),
      category,
      purchased: false,
      createdAt: new Date().toISOString(),
    });
  };

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await updateDoc(doc(db, "shopping_items", id), {
      purchased: !item.purchased,
    });
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "shopping_items", id));
  };

  const clearPurchased = async () => {
    const batch = writeBatch(db);
    const q = query(
      collection(db, "shopping_items"),
      where("purchased", "==", true)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  const getPendingCount = () => items.filter((i) => !i.purchased).length;

  return {
    items,
    loaded,
    addItem,
    toggleItem,
    deleteItem,
    clearPurchased,
    getPendingCount,
  };
}
