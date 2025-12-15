"use client";

import { useAuthUser } from "@/context/AuthUserContext";
import { collection, query, onSnapshot, getFirestore } from "firebase/firestore";
import { useState,useEffect } from "react";

const db = getFirestore();

export function useProducts() {
  const { currentUser } = useAuthUser();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      setProducts([]);
      return;
    }

    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { products };
}
