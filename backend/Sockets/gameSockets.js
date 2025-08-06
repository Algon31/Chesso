import {Chess} from 'chess.js';
import Game from '../models/GameModel.js'


let waitingQ = []; // array for queue 
const Games = {}; // for storing games



export default function gameSetupSocket(io) {
    io.on('connection', (socket)=>{
        console.log("new user connected and ID is:" , socket.id);
        
        socket.on("StartGame", async (playerID)=>{ 
            console.log("player joined :" , playerID);

            // if(!waitingQ.some(player => player.playerID) == playerID){ // check if same user is checking
                waitingQ.push({playerID , socket});
            // } 
            console.log(" wating queue : ",waitingQ);
        
            if(waitingQ.length <= 1){ // if no one is online it just adds to the queue
                socket.emit('WatingForOpponent' , {message : "wait for someone..."})
            }
            else{
                const opponent = waitingQ.shift(); // removes the first element and retuns the element from array

                const newGame = new Game({
                    player1 : opponent.playerID,
                    player2 : playerID,
                    currentP : opponent.playerID,
                    timer : {
                        player1 : 5 * 60 * 1000,
                        player2 : 5 * 60 * 1000,
                    }
                }); // createing a new game

                const savedG = await newGame.save(); //  saves in DB 
                const gameID = savedG._id.toString(); // gameID is the _id from DB

                const chess = new Chess(); // chess instance

                Games[gameID] = { // starting of the game
                    chess,
                    currentplayer : opponent.playerID,
                    player1 : opponent.playerID,
                    player2 : playerID,
                    timer : {
                        player1 : 5 * 60 * 1000,
                        player2 : 5 * 60 * 1000,
                    },
                    timerIntervals : {
                        player1 : null,
                        player2 : null,
                    },
                    status : 'ongoing', // sets the game has started
                };

                socket.join(gameID); // creates a room for 2 people
                opponent.socket.join(gameID); //  joins the other player too

                startTimer(gameID , 'player1' , io);

                opponent.socket.emit('gameStarted' , {
                    gameID,
                    board : chess.fen(),
                    turn : opponent.playerID,
                    player1 : Games[gameID].player1,
                    player2 : Games[gameID].player2,
                    color : 'White',
                }); // sets the first player to white


                socket.emit('gameStarted' , {
                    gameID,
                    board : chess.fen(),
                    turn : opponent.playerID,
                    player1 : Games[gameID].player1,
                    player2 : Games[gameID].player2,
                    color : 'Black',
                }); // sets the current player to black
                
            } 
        });
        socket.on('makeMove', async (gameID , from , to , playerID)=>{
            const game = Games[gameID];
            console.log(`made a move, from ${from} , to : ${to} by ${playerID} `);

            if(!game){
                socket.emit('error' , {
                    message : 'game not found',
                });
                return;
            }

            const chess = game.chess;
            
            if(currentplayer != playerID){
                socket.emit('error',{
                    message : 'Not Your Turn'
                });
                return ;
            }
            
            try{
                chess.move({from , to});
                // { returns this above one....
                //     color: 'w',   // White's move
                //     from: 'e2',   // Started on e2
                //     to: 'e4',     // Moved to e4
                //     flags: 'b',   // Pawn moved two squares
                //     piece: 'p',   // A pawn
                //     san: 'e4'     // Algebraic notation
                // }
                const updateboard = chess.fen();
                const nextTurn = chess.turn() === 'W' ? game.player1 : game.player2; 


                if(Gameover(updateboard)){
                    const result = getGameResult(updateboard , game.player1 , game.player2);

                    game.status = 'finished';
                    game.winner = result.WinnerID;
                    await Game.updateOne({_id : gameID} , {boardState : updateboard , currentplayer : nextTurn });

                    io.to(gameID).emit('gameOver' , result);
                    delete Games[gameID];
                }
                else{
                    game.currentplayer = nextTurn;

                    stopTimer(gameID , playerID === game.player1 ? 'player1' : 'player2');
                    startTimer(gameID , nextTurn === gameplayer1 ? 'player1' : 'player2' , io);

                    io.to(gameID).emit('boardUpdate',{
                        board : updateboard,
                        turn : nextTurn,
                        timer : game.timer,
                    });
                    
                    await Game.updateOne({_id : gameID} , {
                        boardState : boardState,
                        currentplayer : nextTurn,
                    })
                }
            }
            catch(error) {
                console.log('moving piece error : ',error);
                socket.emit('error',{ message : error.message});
            }

        });

        socket.on('disconnect', ()=>{
            console.log('diconnectd client')
        })  
    
    });
}
 
// starts the timer for the player
function startTimer (gameID , player , io){ 
    const game = Games[gameID];
    if(!game) return ;
    
    const interval = setInterval(async () => {
        game.timer[player] -= 1000;
        
        if(game.timer[player] <= 0 ){
            clearInterval(interval);
            game.timerIntervals[player] = null;
            
            const WinnerID = player == 'player1' ? game.player2 : game.player1;
            game.result = WinnerID ;
            
            await Game.updateOne(
                { _id : gameID },
                {
                    status : 'finished',
                    winner : WinnerID,
                    timer : game.timer,
                }
            );
            
            const result = {WinnerID , draw : false , res : 'Time-out'};

            io.on(gameID).emit('gameOver' , result);

            delete Games[gameID];
        }
        else{
            io.to(gameID).emit('timeUpdate',{
                timer : game.timer,
            });
        }

    }, 1000);
    game.timerIntervals[player] = interval;
};

// Stops the timer for the player 
function stopTimer(gameID , player){
    const game = Games[gameID];
    if(!game || !game.timerIntervals[player]) return ;

    clearInterval(game.timerIntervals[player]);
    game.timerIntervals[player] = null;
}   




// checks wether the game is finished
function Gameover (boradState){
    const chess = new chess(boradState);

    if(chess.checkMate() || chess.isDraw || chess.isStalemate() || chess.isInsufficientMaterial()){
        return true;
    }else return false;
}


// return what happend at last
function getGameResult(boradState , player1 , player2){
    const chess = new chess(boradState);

    if(chess.checkMate()){
        const winnerID = chess.turn() === 'W' ? player1 : player2;
        return {WinnerID : winnerID , res : 'CheckMate'};
    }

    if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial()) {
      return { winnerID: null, draw: true };
    }
    return null;
}
