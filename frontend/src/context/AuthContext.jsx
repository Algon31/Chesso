import { createContext, useState, useEffect } from "react";
import BackEndUrl from "../utilites/config";
import Socket from "../utilites/Socket";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(Socket.connected);


  
  // Check if logged in on mount
const checkLogged = async () => {
  try {
    const res = await fetch(`${BackEndUrl}/auth/checklogged`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` },
    });
    console.log(res);
    if (!res.ok) return;
    const data = await res.json();
    setUser(data._id);
  } catch (err) {
    console.log("Error checking login status:", err);
  }
};

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

  // Keep localStorage in sync with user
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
    <AuthContext.Provider value={{ user, setUser, isConnected , checkLogged}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
