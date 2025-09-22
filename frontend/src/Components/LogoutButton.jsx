import { toast } from "sonner";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import BackEndUrl from "../utilites/config";

export default function LogoutButton() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    toast.success("Logging out...");
    if(!user)
    navigate("/signin");
    try {
      const res = await fetch(`${BackEndUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");

      setUser(null);
      localStorage.removeItem("userId");
      toast.success("Logged out successfully");
      navigate("/signin");
    } catch (err) {
      console.error(err);
      toast.error("Error logging out");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed top-5 z-50 right-5 bg-[#B75A48] rounded-sm w-12 h-12 cursor-pointer flex items-center justify-center text-white"
      aria-label="Logout"
    >
      X
    </button>
  );
}
