// src/routes/checkroute.js
const express = require('express');
const router = express.Router();
const Book = require('../models/bookmodel');

router.get('/checkbooks', async (req, res) => {
  try {
    const books = await Book.find().limit(16);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
