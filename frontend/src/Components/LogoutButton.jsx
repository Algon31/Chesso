
// import {userAuth} from '../Auth/userAuth'
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



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
    <>
    <div 
    onClick={handleLogout}
    className='fixed top-5 right-5 bg-[#B75A48] rounded-sm w-12 h-12'>
    
    </div>
    </>
  )
}
