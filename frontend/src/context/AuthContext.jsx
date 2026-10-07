import { createContext, useState, useEffect } from "react";
import BackEndUrl from "../utilites/config";
import Socket from "../utilites/Socket";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => localStorage.getItem("userId") || null);
  const [userData, setUserData] = useState(() => {
    const name = localStorage.getItem("userName");
    const picture = localStorage.getItem("userPicture");
    return name ? { name, profilePicture: picture } : null;
  });
  const [isConnected, setIsConnected] = useState(Socket.connected);

  // Check if logged in on mount
  const checkLogged = async () => {
    try {
      const res = await fetch(`${BackEndUrl}/auth/checklogged`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data._id) {
        setUser(data._id);
        setUserData(data);
        localStorage.setItem("userId", data._id);
        if (data.Name || data.name) {
          localStorage.setItem("userName", data.Name || data.name);
        }
      }
    } catch (err) {
      console.log("Error checking login status:", err);
    }
  };

  useEffect(() => {
    // Check URL parameters for OAuth token / redirect callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("jwtToken", token);
      checkLogged();
    } else {
      checkLogged();
    }
  }, []);

  // Connect socket only if user is logged in
  useEffect(() => {
    if (!user) {
      if (Socket.connected) {
        Socket.disconnect();
        setIsConnected(false);
      }
      return;
    }

    const handleConnect = () => {
      setIsConnected(true);
      console.log("✅ Socket connected:", Socket.id);
    };

    const handleDisconnect = (reason) => {
      setIsConnected(false);
      console.log("❌ Socket disconnected:", reason);
    };

    Socket.on("connect", handleConnect);
    Socket.on("disconnect", handleDisconnect);

    if (!Socket.connected) {
      Socket.connect();
    }

    return () => {
      Socket.off("connect", handleConnect);
      Socket.off("disconnect", handleDisconnect);
    };
  }, [user]);

  // Keep localStorage in sync with user ID
  useEffect(() => {
    if (user) {
      localStorage.setItem("userId", user);
    } else {
      const loc = localStorage.getItem("userId");
      if (loc) {
        setUser(loc);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        userData,
        setUserData,
        isConnected,
        checkLogged,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
