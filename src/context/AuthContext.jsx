import {
  createContext,
  useState,
} from "react";

import {
  loginUser,
} from "../api/authAPI";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const loading= false

  const login = async (credentials) => {
    const data = await loginUser(credentials);

    localStorage.setItem(
      "access_token",
      data.access
    );

    if (data.refresh) {
      localStorage.setItem(
        "refresh_token",
        data.refresh
      );
    }

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



