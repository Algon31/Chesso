import User from '../models/UserModels.js';
import passport from 'passport';



export const register  =  async  (req,res)=>{
    const { Name , email , password } =  req.body;
    try{
        const existingU = await User.findOne({ email }); // checks is a email is there 
        if(existingU){
            return res.status(409).json({message : "user already exists"}); // sends back error
        }
        else{
            const user = new User({ Name , email , password }); // saves user info in a variable

            await user.save(); // saves to mongoDB
            
            res.status(201).json({message : "user registered !"}); // replys a message
        }
    }catch(error){
        console.error("error : " , error);
        res.status(400).json({message : "error occured"});        
    }
};


// for google login 1st part -  this uses the passport.js in the server.js to implement the process
export const Googlein = passport.authenticate("google" , {  
    scope : ["profile" , "email"],
});

export const googlecallback = (req,res)=>{ // this is called for verifying google user
    passport.authenticate("google" , (err, user , info)=>{
        if(!user || err ){
            console.log(err , "user : " , user);
            return res.redirect(`${process.env.FrontEND}/signin`); // if error redirects to signin
        }

        const jwtToken = user.generateAccessToken(); // generate tokken is called from models

        if(jwtToken){ 
            res.cookie("jwtToken",jwtToken,{ // this is the cookie send to the browser(client's)
                httpOnly : true, // in console it wont show
                samesite : "Lax",
                secure : true, // the cookie is sent through the http sever and no where else
            });
            return res.redirect(`${process.env.FrontEND}/Dashboard`);
        }
    })(req , res);
}   

export const login =  async (req , res) =>{
    // console.log("hello");
    const {email , password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message : "user not found"});
        }
        if(!(await user.comparepassword(password))){
            return res.status(401).json({message : "invaild credentials"});
        }

        const tokens = user.generateAccessToken();
        console.log("cookies : " , tokens);
        res.cookie("jwtoken" , tokens , {
            httpOnly : true,
            sameSite : "Lax", // for server its None
            secure : false // for server it is true
        });

        res.json({
            message : "logged in",
            user : {
                name : user.name,
                email : user.email,
                profilePicture : user.profilePicture,
                _id : user._id,
            },
        });
    }
    catch(error){
        res.status(401).json({
            message : "error.message"
        })
    }

}