import { Chess } from 'chess.js';

/**
 * Validates and executes a move on a Chess instance or FEN string.
 * @param {Chess|string} chessOrFen - Chess instance or FEN string
 * @param {Object} moveData - Move parameters { from, to, promotion }
 * @returns {Object} Result { success: boolean, move?: Object, fen?: string, isGameOver?: boolean, error?: string }
 */
export function executeMove(chessOrFen, { from, to, promotion = 'q' }) {
  const chess = typeof chessOrFen === 'string' ? new Chess(chessOrFen) : chessOrFen;

  try {
    const move = chess.move({ from, to, promotion });
    if (!move) {
      return { success: false, error: 'Invalid move' };
    }

    return {
      success: true,
      move,
      fen: chess.fen(),
      turn: chess.turn(),
      isCheck: chess.inCheck(),
      isGameOver: isGameOver(chess),
    };
  } catch (error) {
    return { success: false, error: error.message || 'Illegal move' };
  }
}

/**
 * Checks whether the game has reached a terminal state.
 * @param {Chess|string} chessOrFen - Chess instance or FEN string
 * @returns {boolean}
 */
export function isGameOver(chessOrFen) {
  const chess = typeof chessOrFen === 'string' ? new Chess(chessOrFen) : chessOrFen;
  return (
    chess.isCheckmate() ||
    chess.isDraw() ||
    chess.isStalemate() ||
    chess.isThreefoldRepetition() ||
    chess.isInsufficientMaterial()
  );
}

/**
 * Calculates game result, winner, and conclusion reason.
 * @param {Chess|string} chessOrFen - Chess instance or FEN string
 * @param {string} player1Id - ID of player 1 (White)
 * @param {string} player2Id - ID of player 2 (Black)
 * @returns {Object|null} Result { WinnerID, draw, res }
 */
export function getGameResult(chessOrFen, player1Id, player2Id) {
  const chess = typeof chessOrFen === 'string' ? new Chess(chessOrFen) : chessOrFen;

  if (chess.isCheckmate()) {
    // If it is White's turn ('w') and in checkmate, Black (player2) won.
    const WinnerID = chess.turn() === 'w' ? player2Id : player1Id;
    return { WinnerID, draw: false, res: 'CheckMate' };
  }

  if (chess.isStalemate()) {
    return { WinnerID: null, draw: true, res: 'Stalemate' };
  }

  if (chess.isThreefoldRepetition()) {
    return { WinnerID: null, draw: true, res: 'Threefold Repetition' };
  }

  if (chess.isInsufficientMaterial()) {
    return { WinnerID: null, draw: true, res: 'Insufficient Material' };
  }

  if (chess.isDraw()) {
    return { WinnerID: null, draw: true, res: 'Draw' };
  }

  return null;
}

/**
 * Computes timeout result based on which player ran out of clock time.
 * @param {'player1'|'player2'} timedOutPlayer
 * @param {string} player1Id
 * @param {string} player2Id
 * @returns {Object} Result { WinnerID, draw, res }
 */
export function calculateTimeoutResult(timedOutPlayer, player1Id, player2Id) {
  const WinnerID = timedOutPlayer === 'player1' ? player2Id : player1Id;
  return {
    WinnerID,
    draw: false,
    res: 'Time-Out',
  };
}

/**
 * Computes resignation result based on resigning player ID.
 * @param {string} resigningPlayerId
 * @param {string} player1Id
 * @param {string} player2Id
 * @returns {Object} Result { WinnerID, draw, res }
 */
export function calculateResignationResult(resigningPlayerId, player1Id, player2Id) {
  const WinnerID = resigningPlayerId === player1Id ? player2Id : player1Id;
  return {
    WinnerID,
    draw: false,
    res: 'Resignation',
  };
}
