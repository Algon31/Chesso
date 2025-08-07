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
            res.cookie("jwtToken", jwtToken ,{ // this is the cookie send to the browser(client's)
                httpOnly : true, // in console it wont show
                secure : true, // the cookie is sent through the http sever and no where else
                samesite : "Lax",
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

        const jwtToken = user.generateAccessToken();


        console.log("cookies : " , jwtToken);
        res.cookie("jwToken" , jwtToken , {
            httpOnly : true,
            secure : true, // for server it is true
            sameSite : "Lax", // for server its None
            
        });

        return res.json({
            message : "logged in",
            // token : jwtToken,
            user : {
                name : user.Name,
                email : user.email,
                profilePicture : user.ProfilePicture,
                _id : user._id,
            },
        });
    }
    catch(error){
        res.status(401).json({
            message : "sorry can't help"
        })
    }

}