import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SocketStatus() {
  const { isConnected } = useContext(AuthContext);

  return (
    <div
      className={` fixed bottom-5 right-5 text-white px-3.5 py-2 rounded-md text-sm shadow-lg z-[9999]
    ${isConnected ? "bg-green-600" : "bg-red-600"}
  `}
    >
      {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
    </div>
  );
}
