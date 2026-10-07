import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import Socket from "../../utilites/Socket";
import Exitgame from "../../Components/Exitgame";
import PlayerDiv from "../../Components/PlayerDiv";
import sounds from "../../utilites/soundEffects";

export default function GamePage() {
  const { gameID = "preview" } = useParams();
  const { user, setUser } = useContext(AuthContext);
  const userSaved = localStorage.getItem("userId");
  const navigate = useNavigate();
  const location = useLocation();

  const isDemoMode =
    gameID === "preview" ||
    gameID === "demo" ||
    gameID === "practice" ||
    gameID === "test" ||
    location.pathname === "/preview" ||
    location.pathname === "/practice";

  const gameData = location.state?.gameData;

  const [fen, setFen] = useState(
    gameData?.board || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [currentTurn, setCurrentTurn] = useState("white");
  const [myColor, setMyColor] = useState(gameData?.color || "white");
  const [player1, setPlayer1] = useState(gameData?.player1 || (isDemoMode ? "demo_user" : null));
  const [player2, setPlayer2] = useState(gameData?.player2 || (isDemoMode ? "demo_bot" : null));
  const [myTime, setMyTime] = useState(300000);
  const [opponentTime, setOpponentTime] = useState(300000);
  const [moveFrom, setMoveFrom] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [inCheckSquare, setInCheckSquare] = useState(null);

  const chessRef = useRef(new Chess());
  const currentUser = user || userSaved || (isDemoMode ? "demo_user" : null);

  // Initialize socket or preview mode
  useEffect(() => {
    if (isDemoMode) {
      toast.info("🎯 Preview / Practice Mode: You can move pieces freely to test UI/UX & sounds!", {
        duration: 4000,
      });
      return;
    }

    if (userSaved) {
      setUser(userSaved);
    } else {
      toast.error("Please sign in to play");
      navigate("/signin");
      return;
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
  }, [user, gameID, isDemoMode, navigate, setUser, userSaved]);

  // Sync chess state with FEN & locate King in check
  useEffect(() => {
    try {
      chessRef.current.load(fen);

      if (chessRef.current.inCheck()) {
        const turn = chessRef.current.turn();
        const board = chessRef.current.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === "k" && piece.color === turn) {
              const file = String.fromCharCode(97 + c);
              const rank = 8 - r;
              setInCheckSquare(`${file}${rank}`);
              break;
            }
          }
        }
      } else {
        setInCheckSquare(null);
      }
    } catch (error) {
      console.error("Error updating FEN state:", error);
    }
  }, [fen]);

  // Socket event listeners for multiplayer
  useEffect(() => {
    if (isDemoMode) return;

    const HandleTimerUpdate = (Ttimer) => {
      if (currentUser === player1) {
        setMyTime(Ttimer.timer.player1);
        setOpponentTime(Ttimer.timer.player2);
      } else {
        setMyTime(Ttimer.timer.player2);
        setOpponentTime(Ttimer.timer.player1);
      }
    };

    const HandleBoardUpdate = (data) => {
      setFen(data.board);
      setCurrentTurn(data.turn);
      if (data.isCheck) {
        sounds.playCheck();
        toast.warning("Check!");
      } else {
        sounds.playMove();
      }

      if (currentUser === data.player1) {
        setMyTime(data.timer.player1);
        setOpponentTime(data.timer.player2);
      } else {
        setMyTime(data.timer.player2);
        setOpponentTime(data.timer.player1);
      }
    };

    const HandleGameOver = (result) => {
      sounds.playGameOver();
      if (result.draw) {
        toast.info(`Game Drawn: ${result.res || 'Stalemate'}`);
      } else if (result.WinnerID === currentUser) {
        toast.success(`Victory! Won by ${result.res || 'Checkmate'}`);
      } else {
        toast.error(`Defeat: Lost by ${result.res || 'Checkmate'}`);
      }

      toast.info("Redirecting to Dashboard...");
      setTimeout(() => {
        navigate("/Dashboard");
      }, 4000);
    };

    Socket.on("timerUpdate", HandleTimerUpdate);
    Socket.on("boardUpdate", HandleBoardUpdate);
    Socket.on("gameOver", HandleGameOver);
    Socket.on("invalidMove", (data) => {
      sounds.playIllegalMove();
      toast.error(data.message || "Illegal Move Rejected");
    });

    return () => {
      Socket.off("timerUpdate", HandleTimerUpdate);
      Socket.off("boardUpdate", HandleBoardUpdate);
      Socket.off("gameOver", HandleGameOver);
      Socket.off("invalidMove");
    };
  }, [currentUser, player1, navigate, isDemoMode]);

  const isMyturn = isDemoMode || chessRef.current.turn() === (myColor ? myColor[0] : "w");

  // Prevent dragging opponent pieces in live match
  const isDraggablePiece = ({ piece }) => {
    if (isDemoMode) return true; // In preview/demo, allow moving any piece
    if (!isMyturn) return false;
    const pieceColor = piece[0];
    const expectedColor = myColor === "white" ? "w" : "b";
    return pieceColor === expectedColor;
  };

  // Get legal moves when clicking/dragging
  const getMoveOptions = (square) => {
    const moves = chessRef.current.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setPossibleMoves([]);
      return false;
    }

    const newSquares = moves.map((m) => m.to);
    setPossibleMoves(newSquares);
    return true;
  };

  const onSquareClick = (square) => {
    if (moveFrom) {
      const moves = chessRef.current.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

      if (!foundMove) {
        const hasOptions = getMoveOptions(square);
        if (hasOptions) {
          setMoveFrom(square);
        } else {
          setMoveFrom(null);
          setPossibleMoves([]);
        }
        return;
      }

      ChessMoved(moveFrom, square);
      setMoveFrom(null);
      setPossibleMoves([]);
      return;
    }

    const hasOptions = getMoveOptions(square);
    if (hasOptions) {
      setMoveFrom(square);
    }
  };

  // Move validation and execution
  const ChessMoved = (source, target) => {
    const chess = chessRef.current;
    try {
      const piece = chess.get(source);
      const isPromotion =
        piece &&
        piece.type === "p" &&
        ((piece.color === "w" && target.endsWith("8")) ||
          (piece.color === "b" && target.endsWith("1")));

      const move = chess.move({
        from: source,
        to: target,
        promotion: isPromotion ? "q" : undefined,
      });

      if (move) {
        setFen(chess.fen());
        setLastMove({ from: source, to: target });
        setMoveFrom(null);
        setPossibleMoves([]);
        setCurrentTurn(chess.turn() === "w" ? "white" : "black");

        if (move.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        if (chess.isCheckmate()) {
          sounds.playGameOver();
          toast.success("Checkmate!");
        } else if (chess.inCheck()) {
          sounds.playCheck();
          toast.warning("Check!");
        } else if (chess.isDraw()) {
          sounds.playGameOver();
          toast.info("Draw game!");
        }

        if (!isDemoMode) {
          Socket.emit("makeMove", {
            gameID,
            from: source,
            to: target,
            playerID: currentUser,
            promotion: isPromotion ? "q" : undefined,
          });
        }
        return true;
      } else {
        sounds.playIllegalMove();
        toast.error("Illegal Move: Pawns and pieces can only move to valid legal squares.");
        return false;
      }
    } catch {
      sounds.playIllegalMove();
      toast.error("Illegal Move: Pawns and pieces can only move to valid legal squares.");
      return false;
    }
  };

  // Reset board in demo mode
  const resetDemoBoard = () => {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
    setLastMove(null);
    setMoveFrom(null);
    setPossibleMoves([]);
    setCurrentTurn("white");
    toast.info("Board reset to initial position.");
  };

  const customSquareStyles = useMemo(() => {
    const styles = {};

    possibleMoves.forEach((sq) => {
      styles[sq] = {
        background: "radial-gradient(circle, rgba(0,0,0,.25) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
      styles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
    }

    if (moveFrom) {
      styles[moveFrom] = { backgroundColor: "rgba(100, 200, 255, 0.5)" };
    }

    if (inCheckSquare) {
      styles[inCheckSquare] = {
        backgroundColor: "rgba(255, 0, 0, 0.6)",
        borderRadius: "6px",
      };
    }

    return styles;
  }, [possibleMoves, lastMove, moveFrom, inCheckSquare]);

  const oppid = currentUser === player1 ? player2 : player1;
  const oppColor = myColor === "white" ? "black" : "white";

  return (
    <>
      <div className="h-screen w-full flex flex-col md:flex-row bg-[#1A1A1A] overflow-hidden select-none">
        {/* Board Section */}
        <div className="w-full md:w-3/5 bg-[#2B2625] h-screen flex flex-col justify-center items-center relative p-4">
          {/* Turn Banner */}
          <div className="mb-3 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all shadow-md">
            {isDemoMode ? (
              <span className="text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Practice Mode ({currentTurn}'s move)
              </span>
            ) : isMyturn ? (
              <span className="text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                Your Turn ({myColor})
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Opponent's Turn ({oppColor})
              </span>
            )}
          </div>

          {/* Opponent div on Mobile */}
          <div className="block md:hidden w-full max-w-[420px] mb-2">
            <PlayerDiv
              user={oppid}
              color={oppColor}
              timer={opponentTime}
              turn={currentTurn}
              isMe={false}
            />
          </div>

          {/* Chessboard container */}
          <div className="w-full max-w-[420px] md:max-w-[560px] aspect-square shadow-2xl rounded-xl overflow-hidden border-4 border-[#3D3534]">
            <Chessboard
              position={fen}
              boardOrientation={myColor === "white" ? "white" : "black"}
              onPieceDrop={ChessMoved}
              isDraggablePiece={isDraggablePiece}
              onSquareClick={onSquareClick}
              customSquareStyles={customSquareStyles}
              animationDuration={200}
              snapToCursor={true}
            />
          </div>

          {/* Current player div on Mobile */}
          <div className="block md:hidden w-full max-w-[420px] mt-2">
            <PlayerDiv
              user={currentUser}
              color={myColor}
              timer={myTime}
              turn={currentTurn}
              isMe={true}
            />
          </div>
        </div>

        {/* Sidebar / Desktop Player Info */}
        <div className="hidden md:flex md:w-2/5 bg-[#1A1615] h-screen flex-col justify-between p-8 border-l border-neutral-800/80">
          {/* Top: Opponent Card */}
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
              Opponent
            </div>
            <PlayerDiv
              user={oppid}
              color={oppColor}
              timer={opponentTime}
              turn={currentTurn}
              isMe={false}
            />
          </div>

          {/* Center: Game Info Panel & Demo Controls */}
          <div className="my-auto bg-[#241F1E] border border-neutral-800/60 rounded-xl p-5 shadow-inner flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
              <span className="font-semibold uppercase tracking-wider">Match Status</span>
              <span className="text-emerald-400 font-medium">
                {isDemoMode ? "Practice / Preview" : "Live Match"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Board Orientation</span>
              <button
                onClick={() => setMyColor((c) => (c === "white" ? "black" : "white"))}
                className="flex items-center gap-1.5 text-sm font-semibold text-white capitalize bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded-lg transition-all cursor-pointer"
                title="Click to flip board"
              >
                <span
                  className="w-3 h-3 rounded-full border border-neutral-500"
                  style={{ backgroundColor: myColor === "white" ? "#FFFFFF" : "#1A1A1A" }}
                />
                {myColor} (Flip 🔄)
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">Turn Indicator</span>
              <span
                className={`text-sm font-bold capitalize ${
                  isMyturn ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isDemoMode
                  ? `${currentTurn}'s Turn`
                  : isMyturn
                  ? "Your Move"
                  : "Opponent's Move"}
              </span>
            </div>

            {isDemoMode && (
              <div className="pt-2 border-t border-neutral-800 flex gap-2">
                <button
                  onClick={resetDemoBoard}
                  className="w-full py-2 bg-[#B75A48] hover:bg-[#843E34] text-[#E8ECD6] font-semibold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md"
                >
                  🔄 Reset Board Position
                </button>
              </div>
            )}
          </div>

          {/* Bottom: Current Player Card */}
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
              You
            </div>
            <PlayerDiv
              user={currentUser}
              color={myColor}
              timer={myTime}
              turn={currentTurn}
              isMe={true}
            />
          </div>
        </div>
      </div>
      <Exitgame />
    </>
  );
}
