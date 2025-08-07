import express from 'express'
import { verfiytoken } from '../middleware/verifytoken.js';
import { getUser } from '../controllers/getUser.js';

const router = express.Router();

router.use('/:id' , verfiytoken , (req , res)=>{
    try{
        getUser
    }
    catch(error){
        console.log("user not found" , error)
    }
});

export default router;