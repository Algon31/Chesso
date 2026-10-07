import { useEffect, useState } from "react";
import BackEndUrl from "../utilites/config";

export default function PlayerDiv({ user, color, timer, turn, isMe = false }) {
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check if the current user profile is already in localStorage to save a network fetch
    const storedUserId = localStorage.getItem("userId");
    const storedName = localStorage.getItem("userName");
    const storedPic = localStorage.getItem("userPicture");

    if (user === storedUserId && storedName) {
      setName(storedName);
      setProfilePic(storedPic || "");
      setIsLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${BackEndUrl}/user/${user}`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const userinfo = await res.json();
          setName(userinfo.Name || userinfo.name || "Player");
          setProfilePic(userinfo.ProfilePicture || userinfo.profilePicture || "");
        } else {
          setName(isMe ? "You" : "Opponent");
        }
      } catch (error) {
        setName(isMe ? "You" : "Opponent");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [user, isMe]);

  const formatTime = (timeInMs) => {
    if (typeof timeInMs !== "number" || isNaN(timeInMs)) return "05:00";
    const totalSeconds = Math.max(0, Math.floor(timeInMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const isCurrentTurn = turn === color;
  const isLowTime = timer <= 30000 && timer > 0;

  // Get user initials for fallback avatar
  const displayName = name || (isMe ? "You" : "Opponent");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`w-full p-4 rounded-xl transition-all duration-300 backdrop-blur-md border ${
        isCurrentTurn
          ? "bg-[#2E2827] border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50"
          : "bg-[#221D1C] border-neutral-800 shadow-md"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar & Player Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {profilePic ? (
              <img
                src={profilePic}
                alt={`${displayName}'s avatar`}
                className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B75A48] to-[#791602] flex items-center justify-center text-white font-bold text-base shadow-inner border border-white/10">
                {initials || "♟️"}
              </div>
            )}
            {/* Online / Active status pulse */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#221D1C] ${
                isCurrentTurn ? "bg-emerald-500 animate-pulse" : "bg-neutral-500"
              }`}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-base truncate max-w-[140px] md:max-w-[180px]">
                {isLoading ? "Loading..." : displayName}
              </span>
              {isMe && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-[#B75A48]/30 text-[#E8ECD6] border border-[#B75A48]/40 shrink-0">
                  You
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-neutral-500"
                style={{ backgroundColor: color === "white" ? "#FFFFFF" : "#1A1A1A" }}
              />
              <span className="capitalize">{color}</span>
              {isCurrentTurn && (
                <span className="text-emerald-400 font-medium ml-1">
                  • Thinking...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Digital Chess Clock */}
        <div className="shrink-0">
          <div
            className={`px-3.5 py-1.5 rounded-lg font-mono text-lg md:text-xl font-bold tracking-wider shadow-inner transition-colors ${
              isLowTime
                ? "bg-rose-950/80 text-rose-400 border border-rose-600 animate-pulse"
                : isCurrentTurn
                ? "bg-emerald-950/70 text-emerald-300 border border-emerald-600/60"
                : "bg-neutral-900/90 text-neutral-400 border border-neutral-800"
            }`}
          >
            {formatTime(timer)}
          </div>
        </div>
      </div>
    </div>
  );
}
