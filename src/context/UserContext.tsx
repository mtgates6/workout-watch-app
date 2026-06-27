import React, { createContext, useContext, useState } from "react";

const USER_KEY = "current_user";

// Fixed UUIDs per user — never change these or data will become orphaned
export const USER_IDS: Record<string, string> = {
  matthew: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  amy:     "b2c3d4e5-f6a7-8901-bcde-f12345678901",
};

export function getUserUuid(): string | null {
  const name = localStorage.getItem(USER_KEY);
  return name ? (USER_IDS[name] ?? null) : null;
}

interface UserContextType {
  userId: string | null;   // display name e.g. "matthew"
  userUuid: string | null; // UUID for Supabase e.g. "a1b2c3d4-..."
  setUser: (name: string) => void;
  switchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(USER_KEY));

  const userUuid = userId ? (USER_IDS[userId] ?? null) : null;

  const setUser = (name: string) => {
    localStorage.setItem(USER_KEY, name);
    setUserId(name);
  };

  const switchUser = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("fitness_active_workout");
    window.location.reload();
  };

  return (
    <UserContext.Provider value={{ userId, userUuid, setUser, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
