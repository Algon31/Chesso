import AuthRoutes from './routes/AuthRoutes.js';
import express from 'express';
import mongoose from 'mongoose';
import './middleware/passport.js';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from "dotenv";
import { Server } from 'socket.io';
import gameSetupSocket from './Sockets/gameSockets.js';
import UserRoutes from './routes/UserRoutes.js';
import { globalLimiter, authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import redisClient from './utilites/redisClient.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Trust reverse proxies (Nginx / Docker ingress)
app.set('trust proxy', 1);

app.use(express.json()); // when frontend sends info it make sure it reads properly
app.use(cookieParser()); // now it can read cookies sent by client

// Apply global rate limiting across all incoming requests
app.use(globalLimiter);

const server = http.createServer(app);

const rawOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  "http://localhost:5173",
  "http://localhost:80",
  "http://localhost",
];
const allowedOrigins = Array.from(new Set(rawOrigins.filter(Boolean)));

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('welcome to backend of chesso');
});

// Container & Service Health Check endpoint
app.get('/health', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected';
  const redisStatus = redisClient.status === 'ready' || redisClient.status === 'connect' ? 'healthy' : redisClient.status;
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongo: mongoStatus,
      redis: redisStatus,
    },
  });
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
}); 

gameSetupSocket(io); // sets up game

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
} else {
  console.log("MONGO_URI is not defined in environment variables");
}

app.use('/auth', authLimiter, AuthRoutes); // tells routes for auth where to go with strict rate limit
app.use('/user', apiLimiter, UserRoutes);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

