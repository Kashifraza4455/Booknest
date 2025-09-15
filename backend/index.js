const express = require('express');
const connectDB = require('./db/database');
const dotenv = require('dotenv');
const userRoute = require('./src/routes/userroute');
const bookRoute = require('./src/routes/bookroute');
const { initSocket } = require('./src/functions/socket');
const http = require('http');
const stripeRoutes = require("./src/routes/stripeRoutes");
const walletRoute = require('./src/routes/walletroutes');
const checkRoute = require('./src/routes/checkroute');
const cors = require('cors');

dotenv.config();
const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}));
app.use('/images', express.static('public/images'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api/check', checkRoute);
// Connect to database
connectDB();

// Socket init
initSocket(server);

// ✅ Routes
// Change backend route to /api/user so frontend /api/user/send-otp works
app.use('/api/user', userRoute);
app.use('/api/books', bookRoute);
app.use('/api/wallet', walletRoute);
app.use('/stripe', stripeRoutes);

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
