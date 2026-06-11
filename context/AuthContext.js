import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "@chiabill_auth";

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const { userId: id, user: userData } = JSON.parse(stored);
          setUserId(id);
          setUser(userData);
        }
      } catch (error) {
        console.error("Lỗi tải phiên đăng nhập:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (id, userData) => {
    setUserId(id);
    setUser(userData);
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ userId: id, user: userData }),
    );
  };

  const logout = async () => {
    setUserId(null);
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        user,
        isAuthenticated: !!userId,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng trong AuthProvider");
  }
  return context;
};
