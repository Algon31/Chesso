import AuthRoutes from './routes/AuthRoutes.js'
import express from 'express';
import mongoose, { get } from 'mongoose';
import  './middleware/passport.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
const port = 3000
import dotenv from "dotenv";


dotenv.config();

app.use(cookieParser()); //  now it can read cookies sent by client

app.use(cors({
  origin : process.env.FrontEND, // frontend port 
  methods : ["GET" , "POST" , "PUT" , "DELETE" ],
  credentials : true // this alows cookies to be sent/recive 
}));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!');
})

if(process.env.MONGO_URI){
      mongoose.connect(process.env.MONGO_URI, { //  connncts mongoDB
    }).then(() => {
      console.log("Connected to MongoDB");
    }).catch((err) => {
      console.error("MongoDB connection error:", err);
    });
}else{
  console.log("Defined : MONGO_URI");
}

app.use('/auth', AuthRoutes); // tells routes for auth where to go

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`) // in whch port app is runnnning
})
