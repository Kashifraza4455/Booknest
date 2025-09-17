// index.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./db/database');
const userRoute = require('./src/routes/userroute');
const bookRoute = require('./src/routes/bookroute');
const walletRoute = require('./src/routes/walletroutes');
const checkRoute = require('./src/routes/checkroute');
const { initSocket } = require('./src/functions/socket');
const path = require('path');

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
app.options("*", cors());

// ✅ Static folders
app.use('/images', express.static(path.join(__dirname, 'public/images')));
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
