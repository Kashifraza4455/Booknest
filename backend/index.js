import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import connectDB from './db/database.js';
import userRoute from './src/routes/userroute.js';
import bookRoute from './src/routes/bookroute.js';
import walletRoute from './src/routes/walletroutes.js';
import checkRoute from './src/routes/checkroute.js';
import { initSocket } from './src/functions/socket.js';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// ✅ Load correct .env file
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile });

// ✅ Create Express app
const app = express();
const server = http.createServer(app);

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:5173', // local frontend
  'https://booknest-screens.vercel.app', // Vercel frontend
  'https://booknest-umber.vercel.app'    // Another Vercel frontend
];


app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});


// ✅ Static folders
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Check route
app.use('/api/check', checkRoute);

// ✅ Connect to MongoDB
connectDB();

// ✅ Initialize socket
initSocket(server);

// ✅ API Routes
app.use('/api/user', userRoute);
app.use('/api/books', bookRoute);
app.use('/api/wallet', walletRoute);

// ✅ Default routes
app.get('/', (req, res) => res.send('Welcome to BookNest Backend'));
app.get('/api/books', (req, res) => res.json([{ id: 1, title: 'Book 1' }, { id: 2, title: 'Book 2' }]));

// ✅ PORT setup
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
