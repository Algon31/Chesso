import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import { useRef } from "react";
import Socket from "../../utilites/Socket";
import Exitgame from "../../Components/Exitgame";
import PlayerDiv from "../../Components/PlayerDiv";

export default function GamePage() {
  const { gameID } = useParams(); // gameId will come from the react-router-dom
  const { user, setUser } = useContext(AuthContext);
  // console.log("user from start :",user);
  const userSaved = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();

  const gameData = location.state?.gameData;

  const [fen, setFen] = useState(gameData?.board);
  const [currentTurn, setCurrentTurn] = useState("white");
  const [myTime, setMyTime] = useState(300000);
  const [opponentTime, setOpponentTime] = useState(300000);
  const chessRef = useRef(new Chess());

  const Me = {
    ID: user,
    color: gameData?.color,
  };

  let oppID = gameData?.player1 == user ? gameData?.player2 : gameData?.player1;
  const opp = {
    ID: oppID,
    color: gameData?.color === "white" ? "black" : "white",
  };

  useEffect(() => {
    if (userSaved) {
      // console.log("what is saved", userSaved);
      // const userData = JSON.parse(userSaved);
      setUser(userSaved);
    } else {
      toast.error("Please sign in to play", "error");
      navigate("/signin");
    }

    Socket.emit("recoverGame", { gameID, playerID: userSaved });

    Socket.on("recoverGameState", (data) => {
      // console.log("gamedata on recovery : ", data);
      setFen(data.board);
      setCurrentTurn(data.turn);
      if (!gameData) return;
      gameData.player1 = data.player1;
      gameData.player2 = data.player2;
      gameData.color = data.color;

      if (user === gameData.player1) {
        setMyTime(data.timer.player1);
        setOpponentTime(data.timer.player2);
      } else {
        setMyTime(data.timer.player2);
        setOpponentTime(data.timer.player1);
      }
    });
  }, [user]);

  useEffect(() => {
    // console.log(fen);
    try {
      chessRef.current.load(fen);
    } catch (error) {
      console.log("error in fen : ", error);
    }
  }, [fen]);

  useEffect(() => {
    const HandleTimerUpdate = (Ttimer) => {
      if (user === gameData.player1) {
        setMyTime(Ttimer.timer.player1);
        setOpponentTime(Ttimer.timer.player2);
      } else {
        setMyTime(Ttimer.timer.player2);
        setOpponentTime(Ttimer.timer.player1);
      }
    };

    const HandleMove = ({ fen, turn }) => {
      setFen(fen);
      setCurrentTurn(turn);
    };

    const HandleBoardUpdate = (data) => {
      setFen(data.board);
      setCurrentTurn(data.turn);
      if (user == data.player1) {
        setMyTime(data.timer.player1);
        setOpponentTime(data.timer.player2);
      } else {
        setMyTime(data.timer.player2);
        setOpponentTime(data.timer.player1);
      }
    };

    const HandleGameOver = (result) => {
      if (result.draw) {
        toast.success("Game Is draw");
        // navigate("/Dashboard");
      } else if (result.WinnerID === user) {
        if (result.res === "Time-Out") {
          toast.success("You Won By Time out");
          // navigate("/Dashboard");
        } else if (result.res === "CheckMate") {
          toast.success("You Won By CheckMate");
          // navigate("/Dashboard");
        } else if (result.res === "Resignation") {
          toast.success("You You By Resignation");
        } else {
          toast.error("error in showing result");
        }
      } else {
        if (result.res === "Time-Out") {
          toast.success("You Lose By TimeOut");
          // navigate("/Dashboard");
        } else if (result.res === "CheckMate") {
          toast.success("You You By CheckMate");
          // navigate("/Dashboard");
        } else if (result.res === "Resignation") {
          toast.success("You Won By Resignation");
        } else {
          toast.error("Error showing result");
        }
      }
      toast.success("Redirecting Back To Dashboard...");

      setTimeout(() => {
        navigate("/Dashboard");
      }, 5000);
    };

    Socket.on("timerUpdate", HandleTimerUpdate);
    Socket.on("makeMove", HandleMove);
    Socket.on("boardUpdate", HandleBoardUpdate);
    Socket.on("gameOver", HandleGameOver);
    Socket.on("invalidMove", (data) =>{
        toast.error(data.message || "Invalid Move");
    })

    return () => {
      Socket.off("timerUpdate", HandleTimerUpdate);
      Socket.off("makeMove", HandleMove);
      Socket.off("boardUpdate", HandleBoardUpdate);
      Socket.off("gameOver", HandleGameOver);
    };
  }, [fen]);

  const isMyturn = chessRef.current.turn() == Me.color[0];

  // console.log("Socket connected to:", Socket.io.uri);

  const ChessMoved = (source, target) => {
    console.log(`from : ${source} to : ${target}`);
    if (!isMyturn) {
      toast.success("Not your turn !!");
      return false;
    }
    const chess = chessRef.current;
    
    const move = chess.move({ from: source, to: target, promotion: "q" });
    try {
      if (move) {
        setFen(chess.fen());
        if (chess.inCheck()) {
          if (!chess.isCheckmate()) toast.warning("check!!");
        }
        Socket.emit("makeMove", {
          gameID,
          from: source,
          to: target,
          playerID: user,
        });
        // console.log(gameData?.turn);
        return true;
      } else {
        toast.error("Invalid Move ! try Again");
        return false;
      }
    } catch {
      toast.warning("Invalid Move");
    }
    
  };
  const oppid =
    user === gameData?.player1 ? gameData?.player2 : gameData?.player1;

  return (
    <>
      <div className=" h-screen w-full flex">
        <div className="w-full md:w-3/5 bg-[#B75A48] h-screen flex justify-center items-center">
          <div className="block fixed z-10 top-4 left-4 md:hidden w-60 h-25 bg-amber-900">
            <PlayerDiv
              user={oppid}
              color={opp.color}
              timer={opponentTime}
              turn={currentTurn}
            />
          </div>
          <div className="w-75 md:w-xl md:h-xl border-8 border-[#791602] rounded-sm">
            <Chessboard
              position={fen}
              boardOrientation={Me.color == "white" ? "white" : "black"}
              onPieceDrop={ChessMoved}
            />
          </div>
        </div>
        <div className="block fixed z-10 bottom-4 right-4 md:hidden w-60 h-25 bg-amber-900">
          <PlayerDiv
            user={user}
            color={Me.color}
            timer={myTime}
            turn={currentTurn}
          />
        </div>
        <div className="hidden md:block md:w-2/5 bg-[#E8ECD6] h-screen">
          <PlayerDiv
            user={oppid}
            color={opp.color}
            timer={opponentTime}
            turn={currentTurn}
          />
          <PlayerDiv
            user={user}
            color={Me.color}
            timer={myTime}
            turn={currentTurn}
          />
        </div>
      </div>
      <Exitgame />
    </>
  );
}
