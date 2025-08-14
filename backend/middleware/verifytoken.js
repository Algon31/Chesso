import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verfiytoken = (req , res, next)=>{
    
    const token = req.cookies.jwtToken;
    console.log("Cookies received:", req.cookies);

    if(!token){
        console.log("Token not found!");
        return res.status(401).json({message : "Token not found"});
    }
    
    try{
        const verified = jwt.verify(token , process.env.JWT_Secret_baby);
        console.log("JWT verified:", verified);
        req.user = verified;
        next();
    }
    catch(error){
        console.log("JWT verification error:", error.message);
        res.status(401).send("Invalid Token");
    };
}

export {verfiytoken};
