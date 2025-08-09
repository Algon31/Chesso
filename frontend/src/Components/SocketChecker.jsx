import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SocketStatus() {
  const { isConnected } = useContext(AuthContext);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: isConnected ? "#4CAF50" : "#F44336",
        color: "white",
        padding: "8px 14px",
        borderRadius: "6px",
        fontSize: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
    </div>
  );
}
