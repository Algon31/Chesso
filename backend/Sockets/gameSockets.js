import { Chess } from 'chess.js';
import Game from '../models/GameModel.js'


let waitingQ = []; // array for queue 
const Games = {}; // for storing games



export default function gameSetupSocket(io) {
    io.on('connection', (socket) => {
        console.log("new user connected and ID is:", socket.id);

        socket.on("StartGame", async (playerID) => {
            console.log("player joined:", playerID);

            // Prevent same player from being queued twice
            if (waitingQ.some(entry => entry.playerID === playerID)) {
                socket.emit('waitingForOpponent', {
                    message: "waiting for opponent"
                });
                return;
            }

            if (waitingQ.length === 0) {
                waitingQ.push({ playerID, socket });
                socket.emit('waitingForOpponent', {
                    message: "waiting for opponent"
                });
            } else {
                const opponent = waitingQ.shift(); // removes the first element and retuns the element from array

                const newGame = new Game({
                    player1: opponent.playerID,
                    player2: playerID,
                    currentP: opponent.playerID,
                    timer: {
                        player1: 5 * 60 * 1000,
                        player2: 5 * 60 * 1000,
                    }
                }); // createing a new game

                const savedG = await newGame.save(); //  saves in DB 
                const gameID = savedG._id.toString(); // gameID is the _id from DB

                const chess = new Chess(); // chess instance

                Games[gameID] = { // starting of the game
                    chess,
                    currentP: opponent.playerID,
                    player1: opponent.playerID,
                    player2: playerID,
                    timer: {
                        player1: 5 * 60 * 1000,
                        player2: 5 * 60 * 1000,
                    },
                    timerIntervals: {
                        player1: null,
                        player2: null,
                    },
                    status: 'ongoing', // sets the game has started
                };

                socket.join(gameID); // creates a room for 2 people
                opponent.socket.join(gameID); //  joins the other player too

                startTimer(gameID, 'player1', io);

                opponent.socket.emit('gameStarted', {
                    gameID,
                    board: chess.fen(),
                    turn: opponent.playerID,
                    player1: Games[gameID].player1,
                    player2: Games[gameID].player2,
                    color: 'white',
                }); // sets the first player to white


                socket.emit('gameStarted', {
                    gameID,
                    board: chess.fen(),
                    turn: opponent.playerID,
                    player1: Games[gameID].player1,
                    player2: Games[gameID].player2,
                    color: 'black',
                }); // sets the current player to black

            }
        });
        // console.log(Games);
        socket.on('makeMove', async ({ gameID, from, to, playerID }) => {
            console.log(`made a move, from ${from} , to : ${to} by player : ${playerID} `);
            let game = Games[gameID];

            if (!game) {
                socket.emit('error', {
                    message: 'game not found',
                });
                return;
            }

            const chess = game.chess;
            // console.log("updated  chess ", chess);

            if (game.currentP != playerID) {
                socket.emit('error', {
                    message: 'Not Your Turn'
                });
                return;
            }

            try {
                const move = chess.move({ from, to });

                if (!move) {
                    socket.emit('error', { message: "invalid move" });
                    return
                }

                const updateboard = chess.fen();
                const nextTurn = chess.turn() === 'w' ? game.player1 : game.player2;


                if (Gameover(updateboard)) {
                    const result = getGameResult(updateboard, game.player1, game.player2);

                    game.status = 'Finished';
                    game.Winner = result.WinnerID;
                    await Game.updateOne({ _id: gameID }, { boardState: updateboard, status: 'Finished', currentP: nextTurn });

                    io.to(gameID).emit('gameOver', result);
                    stopTimer(gameID, 'player1');
                    stopTimer(gameID, 'player2');
                    delete Games[gameID];
                }
                else {
                    game.currentP = nextTurn;

                    stopTimer(gameID, playerID === game.player1 ? 'player1' : 'player2');
                    startTimer(gameID, nextTurn === game.player1 ? 'player1' : 'player2', io);

                    io.to(gameID).emit('boardUpdate', {
                        board: updateboard,
                        turn: nextTurn,
                        timer: game.timer,
                        player1: game.player1,
                        player2: game.player2,
                    });
                    await Game.updateOne({ _id: gameID }, {
                        boardState: updateboard,
                        currentP: nextTurn,
                    })
                }
            }
            catch (error) {
                console.log('moving piece error : ', error);
                socket.emit('error', { message: error.message });
            }

        });
        socket.on('recoverGame', async ({ gameID, playerID }) => {


            let game = Games[gameID];

            if (!game) {
                const DbGame = await Game.findById(gameID);
                if (!DbGame) {
                    socket.emit('error', { message: "game not found" });
                    return;
                }

                game = {
                    chess: new Chess(DbGame.boardState),
                    player1: DbGame.player1,
                    player2: DbGame.player2,
                    timer: DbGame.timer,
                    timerIntervals: { player1: null, player2: null },
                    currentP: DbGame.currentP,
                    status: DbGame.status,
                };

                Games[gameID] = game;
            }
            if (![game.player1, game.player2].includes(playerID)) {
                socket.emit('error', { message: "your not in this game" });
                return;
            }
            socket.join(gameID);

            socket.emit('recoverGameState', {
                board: game.chess.fen(),
                turn: game.currentP,
                player1: Games[gameID].player1,
                player2: Games[gameID].player2,
                color: playerID == game.player1 ? 'white' : 'black',
                timer: game.timer,
            });

        })
        socket.on('Resign', async ({ gameID, PlayerID }) => {
            const game = Games[gameID];
            if (!game) return;

            const opponentID = PlayerID === game.player1 ? game.player2 : game.player1;

            await Game.updateOne({_id : gameID},{
                status : "Finished",
                WinnerID : opponentID,
                res : "Resignation",
            })

            io.to(gameID).emit('gameOver', {
                WinnerID: opponentID,
                res: "Resignation",
                draw: false,
            });


            delete Games[gameID];
        });

        socket.on('disconnect', () => {
            console.log('diconnectd client')
        })

    });
}

// starts the timer for the player
function startTimer(gameID, player, io) {
    const game = Games[gameID];
    if (!game) return;

    const interval = setInterval(async () => {
        game.timer[player] -= 1000;

        if (game.timer[player] <= 0) {
            clearInterval(interval);
            game.timerIntervals[player] = null;

            const WinnerID = player == 'player1' ? game.player2 : game.player1;
            game.result = WinnerID;

            await Game.updateOne(
                { _id: gameID },
                {
                    status: 'Finished',
                    WinnerID: WinnerID,
                    timer: game.timer,
                }
            );

            const result = { WinnerID, draw: false, res: 'Time-Out' };

            io.to(gameID).emit('gameOver', result);

            delete Games[gameID];
        }
        else {
            io.to(gameID).emit('timerUpdate', {
                timer: game.timer,
            });
        }

    }, 1000);
    game.timerIntervals[player] = interval;
};

// Stops the timer for the player 
function stopTimer(gameID, player) {
    const game = Games[gameID];
    if (!game || !game.timerIntervals[player]) return;

    clearInterval(game.timerIntervals[player]);
    game.timerIntervals[player] = null;
}




// checks wether the game is finished
function Gameover(boardState) {
    const chess = new Chess(boardState);

    if (chess.isCheckmate() || chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial()) {
        return true;
    } else return false;
}


// return what happend at last
function getGameResult(boardState, player1, player2) {
    const chess = new Chess(boardState);

    if (chess.isCheckmate()) {
        const WinnerID = chess.turn() === 'w' ? player2 : player1;
        return { WinnerID, draw: false, res: 'CheckMate' };
    }

    if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial()) {
        return { WinnerID: null, draw: true };
    }
    return null;
}
