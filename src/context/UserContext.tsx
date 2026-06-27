import React, { createContext, useContext, useState } from "react";

const USER_KEY = "current_user";

interface UserContextType {
  userId: string | null;
  setUser: (name: string) => void;
  switchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(USER_KEY));

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
    <UserContext.Provider value={{ userId, setUser, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
