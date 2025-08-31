const express = require('express');
const connectDB = require('./db/database');
const dotenv = require('dotenv');
const userRoute = require('./src/routes/userroute');
const bookRoute = require('./src/routes/bookroute');
const { initSocket } = require('./src/functions/socket');
const http = require('http');
const stripeRoutes = require("./src/routes/stripeRoutes");
const walletRoute = require('./src/routes/walletroutes');
const cors = require('cors');

dotenv.config();
const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

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

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
