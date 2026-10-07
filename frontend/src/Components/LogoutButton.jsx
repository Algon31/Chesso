import { toast } from "sonner";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import BackEndUrl from "../utilites/config";

export default function LogoutButton() {
  const { user, setUser, setUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    toast.loading("Signing out...", { id: "logout" });

    try {
      await fetch(`${BackEndUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request notice:", err);
    } finally {
      setUser(null);
      if (setUserData) setUserData(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userPicture");
      localStorage.removeItem("jwtToken");
      toast.success("Signed out successfully", { id: "logout" });
      setIsLoggingOut(false);
      navigate("/signin");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      title="Sign Out"
      className="fixed top-4 right-4 md:top-5 md:right-6 z-50 bg-[#B75A48] hover:bg-[#843E34] active:scale-95 text-[#E8ECD6] rounded-xl px-3 py-2 md:px-4 md:py-2.5 shadow-lg border border-[#E8ECD6]/20 transition-all duration-200 flex items-center gap-2 font-medium cursor-pointer"
      aria-label="Logout"
    >
      {/* Logout SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-[#E8ECD6]"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span className="hidden sm:inline text-sm font-semibold tracking-wide">
        Logout
      </span>
    </button>
  );
}
