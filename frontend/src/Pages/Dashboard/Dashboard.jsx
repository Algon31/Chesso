// import Button from "../../Components/Button";
import { useContext } from "react";
import { data, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import { toast } from "sonner";
// import { io } from "socket.io-client";
import { AuthContext } from "../../context/AuthContext";
import LogoutButton from "../../Components/LogoutButton";
// import BackEndUrl from "../../utilites/config";
import { useEffect } from "react";
import Socket from "../../utilites/Socket";
import { useLocation } from "react-router-dom";
// const socket = io(BackEndUrl);

export default function Dashboard() {
  const { user , setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { checkLogged } = useContext(AuthContext);
  const location = useLocation();

  // for google loginn
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    // console.log("token : ", token);

    if (token) {    
      // Save to localStorage
      localStorage.setItem("jwtToken", token);

      // Decode token to get user ID
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload._id);
    }
  }, [location.search]);
  
  // console.log("cookie ",document.cookie);
  useEffect(() => {
    checkLogged();
  }, []);

  useEffect(() => {
    if (user && !Socket.connected) {
      Socket.connect();
    }
  }, [user]);
  useEffect(() => {
    console.log("user : ", user);
  }, [user]);
  

  return (
    <>
      <div className="w-full h-screen bg-[#E8ECD6] m-0 md:pt-15 relative overflow-hidden">
        {/* Navigation & Logout Controls (Accessible on Mobile and Desktop) */}
        <Navbar />
        <LogoutButton />

        <div className="md:w-full flex justify-center h-full pt-16 md:pt-0">
          <div className="w-1/2  h-150 hidden md:flex justify-center items-center">
            {/*image chess*/}
            <img
              src="/assets/Imgs/chessboard.png"
              alt="chess image"
              className="w-125"
            />
          </div>
          <div className=" w-full justify-center md:justify-start md:w-1/2  h-full flex items-center">
            <div className="w-full md:w-2/3 h-3/4  md:ml-10 rounded-sm flex flex-col items-center md:pt-10">
              <span className="text-5xl text-[#B75A48] font-bold text-center">
                Lets Play the Game !
              </span>
              <span className="w-70 mb-5 md:mb-0 md:w-2/3  text-center p-3 text-[#B75A48]">
                Make your way to the top, and increase your problem solving
                skills. Make your opponents know who's playing...
              </span>
              <div className="w-full h-30 flex flex-col md:flex-row md:items-center md:pl-20 items-center">
                <div className=" w-30 h-10 md:w-35 text-sm md:text-lg md:h-12 bg-[#b16d60] rounded-sm text-white flex justify-center items-center px-3">
                  <img
                    src="/assets/Svgs/timer.svg"
                    alt="timer"
                    className="w-5 h-5 mr-3"
                  />
                  5 min
                </div>

                <div className=" w-30 h-10 md:w-40 md:h-12 text-xs md:text-lg bg-[#b16d60] mt-2 md:mt-0 md:ml-20 rounded-sm text-white flex justify-center items-center">
                  <img
                    src="/assets/Svgs/pawn.svg"
                    alt="timer"
                    className="w-5 h-5 mr-3"
                  />
                  White / Black
                </div>
              </div>
              <Button user={user} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Button({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleWaiting = (message) => {
      console.log("waiting message : ", message);
      toast.success("Waiting For Opponents");
    };

    const handleGameStarted = (data) => {
      const { gameID } = data;
      toast.success("Game Started !");
      navigate(`/Gamepage/${gameID}`, { state: { gameData: data } });
    };

    Socket.on("waitingForOpponent", handleWaiting);
    Socket.on("gameStarted", handleGameStarted);

    return () => {
      Socket.off("waitingForOpponent", handleWaiting);
      Socket.off("gameStarted", handleGameStarted);
    };
  }, [navigate]);

  const HandleStart = () => {
    try {
      if (user == null || user == undefined) {
        toast.error("User Not Found");
        toast.error("Please signin");
        navigate("/signin");
        return;
      }
      const PlayerID = user;

      Socket.emit("StartGame", PlayerID);
      console.log("PlayerID :", PlayerID);
    } catch (error) {
      toast.error(`Error Starting Game : ${error}`);
    }
  };
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 md:mt-5">
      <button
        className="bg-[#B75A48] hover:bg-[#843E34] active:scale-95 transition-all text-[#E8ECD6] w-48 md:w-56 h-12 md:h-14 rounded-xl font-bold shadow-lg flex justify-center items-center cursor-pointer border border-[#E8ECD6]/15"
        onClick={HandleStart}
      >
        <img
          src="/assets/Svgs/game-start.svg"
          alt="start"
          className="w-5 h-5 md:w-6 md:h-6 mr-2 text-[#E8ECD6]"
        />
        Find Match
      </button>

      <button
        className="bg-[#2B2625] hover:bg-[#3D3534] active:scale-95 transition-all text-[#E8ECD6] w-48 md:w-56 h-12 md:h-14 rounded-xl font-semibold shadow-md flex justify-center items-center cursor-pointer border border-neutral-700/60"
        onClick={() => navigate("/preview")}
      >
        <span className="mr-2 text-lg">♟️</span>
        Practice / Preview
      </button>
    </div>
  );
}
