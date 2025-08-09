import User from "../models/UserModels.js";



export const getUser = async (req , res)=>{
    const { id } = req.params;
    try{
        const user = await User.findById(id);
        // console.log("die : ",user)
        if(!user){
            return res.status(404).json({error : "user not found in DB"})
        }
        res.status(200).json(user);
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
}