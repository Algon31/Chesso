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
// const socket = io(BackEndUrl);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
      <div className="w-full h-screen bg-[#E8ECD6] m-0 pt-5 relative">
        <Navbar />
        <LogoutButton />
        <div className="h-10" />
        <div className="w-full flex ">
          <div className="w-1/2  h-150 flex justify-center items-center">
            {/*image chess*/}
            <img
              src="/assets/Imgs/chessboard.png"
              alt="chess image"
              className="w-125"
            />
          </div>
          <div className="w-1/2  h-150 flex items-center">
            <div className="w-2/3 h-3/4  ml-10 rounded-xl flex flex-col items-center pt-10">
              <span className="text-5xl text-[#B75A48] font-bold ">
                Lets Play the Game !
              </span>
              <span className="w-2/3 text-center pt-3 text-[#B75A48]">
                Make your way to the top, and increase your problem solving
                skills. Make your opponents know who's playing...
              </span>
              <div className="w-full h-30 flex items-center pl-20">
                <div className="w-35 h-12 bg-[#B75A48] rounded-sm text-white flex justify-center items-center px-3">
                  <img
                    src="/assets/Svgs/timer.svg"
                    alt="timer"
                    className="w-5 h-5 mr-3"
                  />
                  10 min
                </div>

                <div className="w-35 h-12 bg-[#B75A48] ml-20 rounded-sm text-white flex justify-center items-center">
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
        toast.error("user not found");
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
        toast.success("game started !");
        navigate(`/Gamepage/${gameID}`, { state: { gameData: data } });
      });
    } catch (error) {
      toast.error(`error starting game : ${error}`);
    }
  };
  return (
    <>
      <div
        className="bg-[#B75A48] w-70 h-18 rounded-2xl text-center flex justify-center items-center content-center text cursor-pointer"
        onClick={HandleStart}
      >
        <img
          src="/assets/Svgs/game-start.svg"
          alt="start"
          className="w-10 h-10 mr-3"
        />
        Start Game
      </div>
    </>
  );
}
