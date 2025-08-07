import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import LogoutButton from "../../Components/LogoutButton";
import { useRef } from "react";
import BackEndUrl from "../../utilites/config";
import Socket from "../../utilites/Socket";

export default function GamePage() {
  const { gameId } = useParams(); // gameId will come from the react-router-dom
  const { user, setuser } = useContext(AuthContext);
  console.log("user from start :",user);
  const userSaved = localStorage.getItem("user");
  const location = useLocation();
  const navigate = useNavigate();

  const gameData = location.state?.gameData;

  const [fen, setFen] = useState(gameData?.board || 'start');
  const [currentTurn, setCurrentTurn] = useState("white");
  const [myTime, setMyTime] = useState(300000);
  const[opponent , setopponent] = useState("unknown")
  const [opponentTime, setOpponentTime] = useState(300000);
  const chessRef = useRef(new Chess());

  const isMyturn = (currentTurn === 'white' && gameData?.player1 === user) ||
                   (currentTurn === 'black' && gameData?.player2 === user);

  // useEffect(() => {
  //   chessRef.current.load(gameData.board);
  //   setFen(gameData.board);
  // }, [gameData]);
    useEffect(() => {
            if(user){
                console.log("user is here: ",user)
              }else{
                console.log("user not found");
              }
        }, [user])
  const ChessMove = (source, target) => {
    console.log(`from : ${source} to : ${target}`);
    if (!isMyturn) {
      toast.success("not your turn !!");
      return false;
    }
    const chess = chessRef.current;
    const move = chess.move({ from: source, to: target, promotion: "q" });

    
    
    if (move) {
      setFen(chess.fen());
      Socket.emit("makeMove", {
        gameId,
        from: source,
        to: target,
        playerID: user,
      });
      console.log(gameData?.turn);
      setCurrentTurn(chess.turn() === 'w' ? 'white' : 'black');
      return true;
    } else {
      toast.error("invalid move ! try Again");
      return false;
    }
  };
  useEffect(() => {

      const handleBoardUpdate = ({ fen: newFen, turn }) => {
        chessRef.current.load(newFen);
        setFen(newFen);
        setCurrentTurn(turn);
      };

      Socket.on("updateBoard", handleBoardUpdate);

      return () => {
        Socket.off("updateBoard", handleBoardUpdate);
      };
    }, []);


  const getName = async ()=>{
    try{
      const oppid = user === gameData?.player1 ? gameData?.player2 : gameData?.player1;
      console.log("opponent : ",oppid);
      // console.log(`${BackEndUrl}/user/${oppid}`);
      const res = await fetch(`${BackEndUrl}/user/${oppid}`,{
        method : "GET",
        credentials : 'include',
      });
      
      console.log("opponent error : " , res)
      if(res.ok){
        const data = await res.json();
        console.log("oppo name : ",data.name);
        setopponent(data.name)

      }else{
        // toast.error("error fetching  opponent from backend");
      }
    }
    catch (error){
      console.log("cnnot connect to bC",error);
      toast.error("cannot connect to backend");
    }
  }

  // useEffect(() => {
  //   chessRef.current.load(fen);
  // }, [fen]);

  // sets the pieces properly
  useEffect(() => {
    if (gameData?.board) {
      chessRef.current.load(gameData.board);
      setFen(gameData.board);
    }
  }, [gameData]);

  useEffect(() => {
    // Socket.on(timer)
    if(user){
      getName();
    }
    else{
      console.log("user yet to be foound")
    }
  }, []);

  return (
    <>
      <div className=" h-screen w-full flex">
        <div className="w-3/5 bg-[#B75A48] h-screen flex justify-center items-center">
          <div className="w-xl h-xl border-8 border-[#d39e93] rounded-sm">
            <Chessboard
              position={fen}
              boardOrientation={gameData?.player1 === user ? 'white' : 'black'}
              onPieceDrop={ChessMove}
            />
          </div>
        </div>
        <div className="w-2/5 bg-[#E8ECD6] h-screen">
          <div className="w-full h-1/2 flex flex-col justify-center items-center border">
            <div className="w-3/5 h-2/5 bg-black text-white">
            player : {opponent}
            </div>
          </div>
          <div className="w-full h-1/2 flex flex-col justify-center items-center border">
            <div className="w-3/5 h-2/5 bg-black text-white">
            You : {gameData?.name}
            </div>
          </div>
        </div>
      </div>
      <LogoutButton />
    </>
  );
}
