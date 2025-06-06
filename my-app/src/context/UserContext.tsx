"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/library/firebase";

const UserContext = createContext<User | null | undefined>(undefined);
// undefined: 尚未載入
// null: 已載入但未登入
// User: 已登入

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // 自動監聽 Firebase 的登入狀態變化，並即時更新 React 的使用者狀態。
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ?? null); // null 表示未登入);
    });
    return () => unsubscribe();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
