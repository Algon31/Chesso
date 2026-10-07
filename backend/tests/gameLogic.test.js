import test from 'node:test';
import assert from 'node:assert';
import { Chess } from 'chess.js';
import {
  executeMove,
  isGameOver,
  getGameResult,
  calculateTimeoutResult,
  calculateResignationResult,
} from '../utilites/chessGameLogic.js';

test('Game Logic - Valid moves and turn alternation', (t) => {
  const chess = new Chess();
  const player1 = 'user_white_123';
  const player2 = 'user_black_456';

  // 1. White moves e2 -> e4
  const whiteMove = executeMove(chess, { from: 'e2', to: 'e4' });
  assert.strictEqual(whiteMove.success, true, 'e2->e4 should succeed');
  assert.strictEqual(whiteMove.turn, 'b', 'Turn should switch to black');
  assert.strictEqual(whiteMove.isGameOver, false, 'Game should not be over');

  // 2. Black moves e7 -> e5
  const blackMove = executeMove(chess, { from: 'e7', to: 'e5' });
  assert.strictEqual(blackMove.success, true, 'e7->e5 should succeed');
  assert.strictEqual(blackMove.turn, 'w', 'Turn should switch back to white');
});

test('Game Logic - Illegal moves rejection', (t) => {
  const chess = new Chess();

  // Invalid piece movement: pawn moving diagonally without capture
  const invalidMove = executeMove(chess, { from: 'e2', to: 'f3' });
  assert.strictEqual(invalidMove.success, false, 'Illegal diagonal pawn move should fail');
  assert.ok(invalidMove.error, 'Error message should be present');

  // Moving from an empty square
  const emptySquareMove = executeMove(chess, { from: 'e4', to: 'e5' });
  assert.strictEqual(emptySquareMove.success, false, 'Move from empty square should fail');
});

test('Game Logic - Checkmate detection (Fool\'s Mate)', (t) => {
  const chess = new Chess();
  const player1 = 'white_player';
  const player2 = 'black_player';

  // 1. f3 e5 2. g4 Qh4#
  executeMove(chess, { from: 'f2', to: 'f3' });
  executeMove(chess, { from: 'e7', to: 'e5' });
  executeMove(chess, { from: 'g2', to: 'g4' });
  const winningMove = executeMove(chess, { from: 'd8', to: 'h4' });

  assert.strictEqual(winningMove.success, true);
  assert.strictEqual(winningMove.isCheck, true, 'White king should be in check');
  assert.strictEqual(winningMove.isGameOver, true, 'Game should be over on checkmate');

  const result = getGameResult(chess, player1, player2);
  assert.deepStrictEqual(result, {
    WinnerID: player2,
    draw: false,
    res: 'CheckMate',
  }, 'Black player should be declared winner on Fool\'s Mate');
});

test('Game Logic - Stalemate detection', (t) => {
  // Known stalemate position: Black king on a8, White queen on c7, White king on a6
  const stalemateFen = 'k7/2Q5/K7/8/8/8/8/8 b - - 0 1';
  const chess = new Chess(stalemateFen);
  const player1 = 'white_player';
  const player2 = 'black_player';

  assert.strictEqual(isGameOver(chess), true, 'Position should be recognized as game over');
  
  const result = getGameResult(chess, player1, player2);
  assert.deepStrictEqual(result, {
    WinnerID: null,
    draw: true,
    res: 'Stalemate',
  }, 'Result should be draw by Stalemate');
});

test('Game Logic - Insufficient material draw', (t) => {
  // King vs King
  const kvkFen = '8/8/8/4k3/8/8/4K3/8 w - - 0 1';
  const chess = new Chess(kvkFen);
  const player1 = 'white_player';
  const player2 = 'black_player';

  assert.strictEqual(isGameOver(chess), true, 'King vs King should be game over');
  const result = getGameResult(chess, player1, player2);
  assert.deepStrictEqual(result, {
    WinnerID: null,
    draw: true,
    res: 'Insufficient Material',
  });
});

test('Game Logic - Pawn Promotion', (t) => {
  // White pawn on e7 ready to promote on e8
  const promoFen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
  const chess = new Chess(promoFen);

  const promoMove = executeMove(chess, { from: 'e7', to: 'e8', promotion: 'q' });
  assert.strictEqual(promoMove.success, true, 'Promotion to Queen should succeed');
  assert.strictEqual(promoMove.move.promotion, 'q', 'Promoted piece should be queen');
  assert.ok(promoMove.fen.includes('Q'), 'FEN should contain promoted Queen');
});

test('Game Logic - Resignation and Timeout calculators', (t) => {
  const p1 = 'alice';
  const p2 = 'bob';

  // Alice resigns -> Bob wins
  const resignResult = calculateResignationResult('alice', p1, p2);
  assert.deepStrictEqual(resignResult, {
    WinnerID: 'bob',
    draw: false,
    res: 'Resignation',
  });

  // Player 2 runs out of time -> Alice wins
  const timeoutResult = calculateTimeoutResult('player2', p1, p2);
  assert.deepStrictEqual(timeoutResult, {
    WinnerID: 'alice',
    draw: false,
    res: 'Time-Out',
  });
});
