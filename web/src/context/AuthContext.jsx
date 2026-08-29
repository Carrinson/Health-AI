import { createContext, useContext, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  async function login(email, password) {
    // OAuth2PasswordRequestForm on the backend expects FORM data, not JSON —
    // same requirement Swagger's Authorize dialog satisfies automatically.
    // Axios needs this built explicitly.
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const res = await client.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("token", res.data.access_token);
    setToken(res.data.access_token);

    // Fetch the user's role right after login so the sidebar can filter
    // itself immediately, without a second round trip on every page.
    const meRes = await client.get("/auth/me", {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    });
    localStorage.setItem("role", meRes.data.role);
    setRole(meRes.data.role);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}