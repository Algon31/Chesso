import { useEffect, useState } from "react";
import BackEndUrl from "../utilites/config";
import { toast } from "sonner";

export default function PlayerDiv({ user, color, timer, turn }) {
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`${BackEndUrl}/user/${user}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          toast.error("Couldn't find user");
          return;
        }

        const userinfo = await res.json();
        setName(userinfo.Name);
        setProfilePic(userinfo.ProfilePicture);
      } catch (error) {
        console.log("Error fetching name:", error);
      }
    };

    fetchUserInfo();
  }, [user]);

  const formatTime = (timeInMs) => {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ✅ Dynamically change background color
  const isMyTurn = turn === color;
  const timerBgClass = isMyTurn ? "bg-green-500" : "bg-[#b2acac]"; // green when active, grey when not

  return (
    <div className="w-full h-1/2 flex flex-col justify-center items-center border ">
      <div className="w-3/5 h-2/5 bg-[#B75A48] text-white flex flex-col rounded-sm">
        <div className="flex h-3/5">
          {profilePic && (
            <img
              src={profilePic}
              alt={`${name}'s profile`}
              className="w-16 h-16 rounded-sm m-2"
            />
          )}
          <div className="ml-2 flex flex-col">
            <div className="mt-3">player : {name}</div>
            <div>Playing as : {color}</div>
          </div>
        </div>
        <div className="w-full h-2/5 flex justify-center items-center">
          <span
            className={`${timerBgClass} w-2/3 h-2/3 flex justify-center items-center`}
          >
            {formatTime(timer)}
          </span>
        </div>
      </div>
    </div>
  );
}
