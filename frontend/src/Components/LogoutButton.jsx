import BackEndUrl from "../utilites/config";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";

export default function LogoutButton() {
  const { setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BackEndUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");

      // Clear user from context & localStorage
      setUser(null);
      localStorage.removeItem("userId");

      toast.success("Logged out successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error logging out");
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
}
