import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function Board() {
  const [game, setGame] = useState(new Chess());
  
  function makeAMove(move) {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    
    if (result) {
      setGame(gameCopy);
      return true;
    }
    return false;
  }

  function onDrop(sourceSquare, targetSquare) {
    console.log("Attempting move from", sourceSquare, "to", targetSquare);
    
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });
    
    if (move) {
      console.log("Move successful!");
      return true;
    }
    
    console.log("Illegal move");
    return false;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Chess Game</h2>
        <p className="text-sm text-gray-600">
          Turn: {game.turn() === 'w' ? 'White' : 'Black'}
        </p>
      </div>
      
      <div className="w-[500px] h-[500px] border-4 border-gray-400">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={500}
        />
      </div>
      
      <div className="mt-4 space-x-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setGame(new Chess())}
        >
          Reset Game
        </button>
        <button 
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => {
            const gameCopy = new Chess(game.fen());
            gameCopy.undo();
            setGame(gameCopy);
          }}
        >
          Undo Move
        </button>
      </div>
      
      {game.isCheckmate() && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Checkmate! {game.turn() === 'w' ? 'Black' : 'White'} wins!
        </div>
      )}
      
      {game.isCheck() && (
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Check!
        </div>
      )}
    </div>
  );
}