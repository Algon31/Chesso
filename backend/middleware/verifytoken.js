import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();

const verfiytoken = (req , res, next)=>{
    
    const token = req.cookies.jwtToken;
    // console.log(req.cookies);

    if(!token){
        // console.log("token was not found", token);
        return res.status(401).json({message : "Access Denied"});
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


