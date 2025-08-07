import AuthRoutes from './routes/AuthRoutes.js'
import express from 'express';
import mongoose, { get } from 'mongoose';
import  './middleware/passport.js';
import http from 'http'
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
const port = 3000
import dotenv from "dotenv";
import { Server } from 'socket.io';
import gameSetupSocket from './Sockets/gameSockets.js';

import UserRoutes from './routes/UserRoutes.js'

dotenv.config();

app.use(cookieParser()); //  now it can read cookies sent by client

app.use(express.json()); // when frontend sends info it make sure it reads properly

const server = http.createServer(app);

const allowedOrigins = [
  process.env.FrontEND,
  process.env.FrontEND_origins,
  "http://localhost:5173",
];

app.use(cors({
  origin : allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));


app.get('/', (req, res) => {
  res.send('welcome to backend of chesso');
})

const io = new Server(server, {
  cors :{
  origin : allowedOrigins,
  methods :  ["GET", "POST", "PUT", "DELETE"],
  credentials : true,
}}); 

gameSetupSocket(io); // sets up game  


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
app.use('/user' , UserRoutes)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`) // in whch port app is runnnning
})
