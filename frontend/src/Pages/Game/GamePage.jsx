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
  const userSaved = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();

  const gameData = location.state?.gameData;

  const [fen, setFen] = useState(gameData?.board || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [currentTurn, setCurrentTurn] = useState("white");
  const [myColor, setMyColor] = useState(gameData?.color || "white");
  const [player1, setPlayer1] = useState(gameData?.player1 || null);
  const [player2, setPlayer2] = useState(gameData?.player2 || null);
  const [myTime, setMyTime] = useState(300000);
  const [opponentTime, setOpponentTime] = useState(300000);
  const chessRef = useRef(new Chess());

  const currentUser = user || userSaved;

  useEffect(() => {
    if (userSaved) {
      setUser(userSaved);
    } else {
      toast.error("Please sign in to play");
      navigate("/signin");
    }

    Socket.emit("recoverGame", { gameID, playerID: userSaved });

    Socket.on("recoverGameState", (data) => {
      setFen(data.board);
      setCurrentTurn(data.turn);
      setPlayer1(data.player1);
      setPlayer2(data.player2);
      setMyColor(data.color);

      if (userSaved === data.player1) {
        setMyTime(data.timer.player1);
        setOpponentTime(data.timer.player2);
      } else {
        setMyTime(data.timer.player2);
        setOpponentTime(data.timer.player1);
      }
    });

    return () => {
      Socket.off("recoverGameState");
    };
  }, [user]);

  useEffect(() => {
    try {
      chessRef.current.load(fen);
    } catch (error) {
      console.log("error in fen : ", error);
    }
  }, [fen]);

  useEffect(() => {
    const HandleTimerUpdate = (Ttimer) => {
      if (currentUser === player1) {
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
      if (currentUser == data.player1) {
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
      } else if (result.WinnerID === currentUser) {
        if (result.res === "Time-Out") {
          toast.success("You Won By Time out");
        } else if (result.res === "CheckMate") {
          toast.success("You Won By CheckMate");
        } else if (result.res === "Resignation") {
          toast.success("You Won By Resignation");
        } else {
          toast.error("Error in showing result");
        }
      } else {
        if (result.res === "Time-Out") {
          toast.error("You Lost By TimeOut");
        } else if (result.res === "CheckMate") {
          toast.error("You Lost By CheckMate");
        } else if (result.res === "Resignation") {
          toast.error("You Lost By Resignation");
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
    });

    return () => {
      Socket.off("timerUpdate", HandleTimerUpdate);
      Socket.off("makeMove", HandleMove);
      Socket.off("boardUpdate", HandleBoardUpdate);
      Socket.off("gameOver", HandleGameOver);
      Socket.off("invalidMove");
    };
  }, [fen, currentUser, player1]);

  const isMyturn = chessRef.current.turn() === (myColor ? myColor[0] : 'w');

  const ChessMoved = (source, target) => {
    console.log(`from : ${source} to : ${target}`);
    if (!isMyturn) {
      toast.warning("Not your turn !!");
      return false;
    }
    const chess = chessRef.current;
    
    try {
      const move = chess.move({ from: source, to: target, promotion: "q" });
      if (move) {
        setFen(chess.fen());
        if (chess.inCheck()) {
          if (!chess.isCheckmate()) toast.warning("check!!");
        }
        Socket.emit("makeMove", {
          gameID,
          from: source,
          to: target,
          playerID: currentUser,
          promotion: "q",
        });
        return true;
      } else {
        toast.error("Invalid Move ! try Again");
        return false;
      }
    } catch {
      toast.warning("Invalid Move");
      return false;
    }
  };

  const oppid = currentUser === player1 ? player2 : player1;
  const oppColor = myColor === "white" ? "black" : "white";

  return (
    <>
      <div className=" h-screen w-full flex">
        <div className="w-full md:w-3/5 bg-[#B75A48] h-screen flex justify-center items-center">
          <div className="block fixed z-10 top-4 left-4 md:hidden w-60 h-25 bg-amber-900">
            <PlayerDiv
              user={oppid}
              color={oppColor}
              timer={opponentTime}
              turn={currentTurn}
            />
          </div>
          <div className="w-75 md:w-xl md:h-xl border-8 border-[#791602] rounded-sm">
            <Chessboard
              position={fen}
              boardOrientation={myColor == "white" ? "white" : "black"}
              onPieceDrop={ChessMoved}
            />
          </div>
        </div>
        <div className="block fixed z-10 bottom-4 right-4 md:hidden w-60 h-25 bg-amber-900">
          <PlayerDiv
            user={currentUser}
            color={myColor}
            timer={myTime}
            turn={currentTurn}
          />
        </div>
        <div className="hidden md:block md:w-2/5 bg-[#E8ECD6] h-screen">
          <PlayerDiv
            user={oppid}
            color={oppColor}
            timer={opponentTime}
            turn={currentTurn}
          />
          <PlayerDiv
            user={currentUser}
            color={myColor}
            timer={myTime}
            turn={currentTurn}
          />
        </div>
      </div>
      <Exitgame />
    </>
  );
}
