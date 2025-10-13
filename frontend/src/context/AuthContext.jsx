// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "../lib/axios";
import { API_ENDPOINTS } from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // chứa role, profile, ...
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // use api instance which automatically attaches Authorization header
        const res = await api.get(API_ENDPOINTS.AUTH_PROFILE);
        // backend may return different shapes depending on endpoint
        // Try common possibilities: { user }, { employee }, { success, employee }, { patient }
        const data = res.data || {};
        if (data.user) setUser(data.user);
        else if (data.employee) setUser(data.employee);
        else if (data.patient) setUser(data.patient);
        else if (data.success && data.employee) setUser(data.employee);
        else if (data.success && data.user) setUser(data.user);
        else setUser(data);
      } catch (error) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
