import mongoose from "mongoose"
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken' // used to generate tokens
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
    Name : {type : String , required : true},
    email : {type : String , required : true , unique : true},
    password : {type : String , required : true},

    ProfilePicture : {
        type : String ,
    },

    emailVerified : {
        type : Boolean,
        default : false,
    },
});

userSchema.pre('save',async function (next){
    if(this.isModified("password") || this.isNew){ // checks if password was modified or changed.
            try{
                const salt = await bcrypt.genSalt(10);// salt for hash
                this.password = await bcrypt.hash(this.password , salt); // creating a hash using salt
                next(); // continue with saving
            }
            catch(error){
                next(error); // catchs the error
            };
    }
    else{
        next();
    }
});

userSchema.methods.comparepassword = async function (inputp){
    return await bcrypt.compare(inputp , this.password)
}

userSchema.methods.generateAccessToken = function (){  // mainly three parts 
    return jwt.sign( // header is usally defined by the jsonwebtoken library.
        {
            _id : this._id,
            name : this.name,
            email : this.email // your details as payload (your info)
        },
        process.env.JWT_Secret_baby , // tis is your signature 
        {expiresIn : process.env.JWT_Expiry.toString()} // expiry time of jet token
    ); // at last while returning the token is encoded and seperated by dots
};


const User = mongoose.model("user", userSchema);
export default User;