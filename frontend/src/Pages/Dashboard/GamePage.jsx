import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from 'chess.js'
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import LogoutButton from "../../Components/LogoutButton";
import { useRef } from "react";
import { io } from "socket.io-client";
import BackEndUrl from "../../utilites/config";
const Socket = io(BackEndUrl);

export default function GamePage() {
  const { gameId } = useParams(); // gameId will come from the react-router-dom
  const {user , setuser} = useContext(AuthContext);
  const userSaved = localStorage.getItem('user');
  const location = useLocation();
  const navigate = useNavigate();

  const gameData = location.state?.gameData;


  const [fen , setFen] = useState(gameData?.board || "start");
  const[currentTurn , setCurrentTurn] = useState(gameData?.turn);
  const chessRef = useRef(new Chess());

  const isMyturn = currentTurn === user;


  useEffect(() => {
    chessRef.current.load(gameData.board);
    setFen(gameData.board);
  }, [gameData])

  const ChessMove = (source, target) => {
    console.log(`from : ${source} to : ${target}`);
    if(!isMyturn){
        toast.success("not your turn !!");
        return false;
    }
    const chess = chessRef.current;
    const move = chess.move({from : source , to : target, promotion: 'q'  });

    if(move){
      setFen(chess.fen());
      Socket.emit('makeMove', {gameId, from : source , to : target , playerID : user});
      return true;
    }
    else{
      toast.error("invalid move ! try Again");
      return false;
    }
  };



  // sets the pieces properly 
  useEffect(() => {
    if(gameData?.board){
      chessRef.current.load(gameData.board);
      setFen(gameData?.board);
    }
  }, [gameData])
  
  return (
    <>
      <div className=" h-screen w-full flex">
        <div className="w-3/5 bg-[#B75A48] h-screen flex justify-center items-center">
          <div className="w-xl h-xl border-8 border-[#d39e93] rounded-sm">
          <Chessboard
            position={fen}
            boardOrientation={gameData?.turn}
            onPieceDrop={ChessMove}
          />
          </div>
        </div>
        <div className="w-2/5 bg-[#E8ECD6] h-screen">
          <div className="w-full h-1/2 flex flex-col justify-center items-center border">
            <div className="w-3/5 h-2/5 bg-black"></div>
          </div>
          <div className="w-full h-1/2 flex flex-col justify-center items-center border">
            <div className="w-3/5 h-2/5 bg-black "></div>
          </div>

        </div>
      </div>
      <LogoutButton/>
    </>
  );
}
