// src/routes/checkroute.js
import express from 'express';
import Book from '../models/bookmodel.js';

const router = express.Router();

router.get('/checkbooks', async (req, res) => {
  try {
    const books = await Book.find().limit(16);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
