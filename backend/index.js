const express = require('express');
const connectDB = require('./db/database');
const dotenv = require('dotenv');
const userRoute = require('./src/routes/userroute');
const bookRoute = require('./src/routes/bookroute');
const { initSocket } = require('./src/functions/socket');
const http = require('http');
const walletRoute = require('./src/routes/walletroutes');
const checkRoute = require('./src/routes/checkroute');
const cors = require('cors');

dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://booknest-screeen.vercel.app/' // new Vercel deploy domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/curl
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Static files
app.use('/images', express.static('public/images'));
app.use('/uploads', express.static('uploads'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/check', checkRoute);
app.use('/api/user', userRoute);
app.use('/api/books', bookRoute);
app.use('/api/wallet', walletRoute);

// DB connection
connectDB();

// Socket init
initSocket(server);

// Home route
app.get('/', (req, res) => {
  res.send('Welcome here');
});

app.get('/api/books', (req, res) => {
  res.json([{ id: 1, title: 'Book 1' }, { id: 2, title: 'Book 2' }]);
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
