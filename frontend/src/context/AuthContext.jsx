import { createContext, useState, useEffect } from "react";
import BackEndUrl from "../utilites/config";
import { toast } from "sonner";
import Socket from "../utilites/Socket";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(Socket.connected);

  // Track socket connection status
  useEffect(() => {
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

    // You can manually connect here if needed
    if (!Socket.connected) {
      Socket.connect();
    }

    return () => {
      Socket.off("connect", handleConnect);
      Socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Check if logged in
  useEffect(() => {
     const controller = new AbortController();
    const checkStatus = async () => {
      try {
        const response = await fetch(`${BackEndUrl}/auth/check-logged`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (response.ok) {
          const jsondata = await response.json();
          setUser(jsondata._id);
          console.log("User loaded:", jsondata._id);
          localStorage.setItem("userId", jsondata._id);
        } else {
          console.log("Error checking logged info", response);
        }
      } catch (error) {
        toast.error("Error checking login status");
      }
    };

    checkStatus();
  }, []);

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
    <AuthContext.Provider value={{ user, setUser, isConnected }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
