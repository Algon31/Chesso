import mongoose from 'mongoose'


const gameSchema = new mongoose.Schema({
    player1 : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    player2 : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},

    boardState : {
        type : String,
        default : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        // pawns -- white's turn -- castling is ok -- 
    },

    currentP : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },

    status :{
        type: String,
        enum : ['waiting' , 'ongoing' , 'finished'],
        default : 'waiting',
    },

    currentP : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        default: null,
    },

    timer : {
        player1 : {type : Number , required : true},
        player2 : {type : Number , required : true}
    }


});

const Game = mongoose.model('Game' , gameSchema);
export default Game;