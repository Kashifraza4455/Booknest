// src/App.jsx
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store/store';
import AllBooks from './Allbooks.jsx'
import Login from "./commponent/Login.jsx";
import Signup from "./commponent/Signup.jsx";
import Forget from "./commponent/Forget.jsx";
import Reset from "./commponent/Reset.jsx"
import Password from "./commponent/Password.jsx"
import BookList from './commponent/Booklist.jsx';

// Import your other components

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Default route redirect to login */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />         
            <Route path="/forget" element={<Forget />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/password" element={<Password />} />
            <Route path="/booklist" element={<BookList />} />
            <Route path="/allbooks" element={<AllBooks />} />
            {/* Add more routes as needed */}
            {/* <Route path="/dashboard" element={<DashboardScreen />} /> */}
          </Routes>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;