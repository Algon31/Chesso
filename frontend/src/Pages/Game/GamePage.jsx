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
  const { gameID } = useParams();
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
  const [moveFrom, setMoveFrom] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [inCheckSquare, setInCheckSquare] = useState(null);

  const chessRef = useRef(new Chess());
  const currentUser = user || userSaved;

  useEffect(() => {
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
  }, [user, gameID, navigate, setUser, userSaved]);

  useEffect(() => {
    try {
      chessRef.current.load(fen);

      // Locate king square if in check
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
  }, [currentUser, player1, navigate]);

  const isMyturn = chessRef.current.turn() === (myColor ? myColor[0] : "w");

  // Prevent dragging opponent pieces or moving out of turn
  const isDraggablePiece = ({ piece }) => {
    if (!isMyturn) return false;
    const pieceColor = piece[0]; // 'w' or 'b'
    const expectedColor = myColor === "white" ? "w" : "b";
    return pieceColor === expectedColor;
  };

  // Get legal move highlights when square is clicked or dragged
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
    if (!isMyturn) return;

    // If already selected a piece, attempt to move
    if (moveFrom) {
      const moves = chessRef.current.moves({
        square: moveFrom,
        verbose: true,
      });
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

      if (!foundMove) {
        // Clicked another friendly piece
        const hasOptions = getMoveOptions(square);
        if (hasOptions) {
          setMoveFrom(square);
        } else {
          setMoveFrom(null);
          setPossibleMoves([]);
        }
        return;
      }

      // Execute move
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

  // Execute piece drop and validate legality
  const ChessMoved = (source, target) => {
    if (!isMyturn) {
      sounds.playIllegalMove();
      toast.warning("Wait for your opponent's turn!");
      return false;
    }

    const chess = chessRef.current;
    try {
      // Check if this is a pawn promotion move
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

        if (move.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        if (chess.inCheck()) {
          sounds.playCheck();
          if (!chess.isCheckmate()) toast.warning("Check!");
        }

        Socket.emit("makeMove", {
          gameID,
          from: source,
          to: target,
          playerID: currentUser,
          promotion: isPromotion ? "q" : undefined,
        });
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

  // Custom square styles for highlights, check indicators, and legal move dots
  const customSquareStyles = useMemo(() => {
    const styles = {};

    // Legal moves dots
    possibleMoves.forEach((sq) => {
      styles[sq] = {
        background: "radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });

    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
      styles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
    }

    // Selected piece highlight
    if (moveFrom) {
      styles[moveFrom] = { backgroundColor: "rgba(100, 200, 255, 0.5)" };
    }

    // King in check red highlight
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
            {isMyturn ? (
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
          <div className="block md:hidden w-full max-w-xs mb-2">
            <PlayerDiv
              user={oppid}
              color={oppColor}
              timer={opponentTime}
              turn={currentTurn}
            />
          </div>

          {/* Chessboard container */}
          <div className="w-full max-w-[420px] md:max-w-[560px] aspect-square shadow-2xl rounded-lg overflow-hidden border-4 border-[#3D3534]">
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
          <div className="block md:hidden w-full max-w-xs mt-2">
            <PlayerDiv
              user={currentUser}
              color={myColor}
              timer={myTime}
              turn={currentTurn}
            />
          </div>
        </div>

        {/* Sidebar / Desktop Player Info */}
        <div className="hidden md:flex md:w-2/5 bg-[#1F1B1A] h-screen flex-col justify-between p-8 border-l border-neutral-800">
          <div className="bg-[#2B2625] rounded-xl p-4 shadow-lg">
            <PlayerDiv
              user={oppid}
              color={oppColor}
              timer={opponentTime}
              turn={currentTurn}
            />
          </div>

          <div className="bg-[#2B2625] rounded-xl p-4 shadow-lg">
            <PlayerDiv
              user={currentUser}
              color={myColor}
              timer={myTime}
              turn={currentTurn}
            />
          </div>
        </div>
      </div>
      <Exitgame />
    </>
  );
}
