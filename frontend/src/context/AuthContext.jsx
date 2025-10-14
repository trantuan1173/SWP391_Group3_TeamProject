import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "../lib/axios";
import { API_ENDPOINTS } from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(API_ENDPOINTS.AUTH_PROFILE, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Nhận diện cả employee và patient
        if (res.data.employee) {
          setUser({ ...res.data.employee, type: "employee" });
        } else if (res.data.patient) {
          setUser({ ...res.data.patient, type: "patient" });
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err.response || err.message);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (employee, token) => {
    localStorage.setItem("token", token);
    setUser(employee);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);