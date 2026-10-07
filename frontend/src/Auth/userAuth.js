import { useContext } from 'react';
import BackEndUrl from '../utilites/config';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const userAuth = () => {
  const navigate = useNavigate();
  const { setUser, setUserData } = useContext(AuthContext);

  // Register a new user
  const handleRegister = async (userdata) => {
    try {
      toast.loading("Creating your Chesso account...", { id: "auth" });
      const response = await fetch(`${BackEndUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userdata),
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === 429) {
        toast.error("Too many signup attempts. Please slow down and try again later.", { id: "auth" });
        return;
      }

      if (response.ok) {
        toast.success("Account created successfully! Please sign in.", { id: "auth" });
        navigate("/signin");
      } else {
        if (data.message === "user already exists" || response.status === 409) {
          toast.info("An account with this email already exists. Please sign in.", { id: "auth" });
          navigate("/signin");
        } else {
          toast.error(data.message || "Registration failed. Please check your details.", { id: "auth" });
        }
      }
    } catch (error) {
      toast.error(error.message || "Network error during registration.", { id: "auth" });
    }
  };

  // Sign in existing user
  const handleSignin = async (userdata) => {
    try {
      toast.loading("Authenticating...", { id: "auth" });
      const response = await fetch(`${BackEndUrl}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userdata),
      });

      if (response.status === 429) {
        toast.error("Too many login attempts. Please wait a few minutes before trying again.", { id: "auth" });
        return;
      }

      const data = await response.json();

      if (response.ok && data.user) {
        toast.success(`Welcome back, ${data.user.name || 'Player'}!`, { id: "auth" });
        setUser(data.user._id);
        if (setUserData) setUserData(data.user);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name || "Player");
        if (data.user.profilePicture) {
          localStorage.setItem("userPicture", data.user.profilePicture);
        }
        navigate("/Dashboard");
      } else {
        toast.error(data.message || "Invalid email or password", { id: "auth" });
      }
    } catch (error) {
      toast.error(error.message || "Unable to connect to backend server.", { id: "auth" });
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      await fetch(`${BackEndUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      setUser(null);
      if (setUserData) setUserData(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userPicture");
      localStorage.removeItem("jwtToken");
      toast.info("Signed out successfully.");
      navigate("/signin");
    }
  };

  return { handleRegister, handleSignin, handleLogout };
};
