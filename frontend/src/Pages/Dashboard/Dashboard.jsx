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
      <div className="w-full h-screen bg-[#E8ECD6] m-0 md:pt-15 relative">
        <div className="hidden md:block">
          <Navbar />
          <LogoutButton />
        </div>
        <div className="md:w-full flex justify-center h-full">
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
                  10 min
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

      Socket.on("waitingForOpponent", (message) => {
        console.log("waitng message : ", message);
        toast.success("Wating For Opponents");
      });

      Socket.on("gameStarted", (data) => {
        const { gameID } = data;
        toast.success("Game Started !");
        navigate(`/Gamepage/${gameID}`, { state: { gameData: data } });
      });
    } catch (error) {
      toast.error(`Error Starting Game : ${error}`);
    }
  };
  return (
    <>
      <div
        className="bg-[#B75A48] w-40 md:w-70 h-12 md:h-18 rounded-sm md:rounded-xl  text-center md:mt-5 flex justify-center items-center content-center text cursor-pointer"
        onClick={HandleStart}
      >
        <img
          src="/assets/Svgs/game-start.svg"
          alt="start"
          className="w-6 md:w-10 md:h-10 mr-3 text-[#E8ECD6]"
        />
        Start Game
      </div>
    </>
  );
}
