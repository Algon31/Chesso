import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();

const verfiytoken = (req , res, next)=>{
    
    const token = req.cookies.jwtToken;
    console.log("Cookies received:", req.cookies);

    // console.log("here is the token : ",req.cookies.jwtToken);

    // console.log("token passcode :",process.env.JWT_Secret_baby)
    console.log("token :", token);
    if(!token){
        return res.status(401).json({message : "ok buddy token is invalid"});
    }
    try{
        const verified = jwt.verify(token , process.env.JWT_Secret_baby);
        req.user = verified;
        next();
    }
    catch(error){
        res.status(401).send("Invalid Token");
    };
    
}




export {verfiytoken};


