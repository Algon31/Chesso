import { Router } from "express";
import { register , Googlein , googlecallback , login } from "../controllers/AuthControllers.js";
import { verfiytoken } from "../middleware/verifytoken.js";

const router = Router()


router.post('/register', register); // for regitser sends the register function from authcontrollers
router.get('/google', Googlein)  // we should use get
router.get('/google/callback', googlecallback );

router.get('/checklogged', verfiytoken ,(req , res)=>{
        return res.json(req.user);
});

router.post('/signin' , login );



export default router;