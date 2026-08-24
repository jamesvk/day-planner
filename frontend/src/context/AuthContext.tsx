import { createContext, useState, useContext } from "react";
import type { AuthProviderProps, AuthContextType } from "../types";
import { registerUser, loginUser } from "../api/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [userId, setUserId] = useState<string | null>(() =>
    localStorage.getItem("userId"),
  );

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    setUserId(data.id);
    localStorage.setItem("userId", data.id);
    setToken(data.accessToken);
    localStorage.setItem("token", data.accessToken);
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => {
    const data = await registerUser(firstName, lastName, email, password);
    setUserId(data.id);
    localStorage.setItem("userId", data.id);
    setToken(data.accessToken);
    localStorage.setItem("token", data.accessToken);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem("userId");
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ userId, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");

  return ctx;
}
