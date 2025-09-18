import express from 'express';
import verifyToken from "../middleware/authmiddleware.js"; 
import { 
  getbooksglobaly, addBook, getBooks, markAsSold, toggleActiveStatus, searchBook,
  selectedBook, likeBook, getLikedBooks, editBook, deleteBook, 
  getRequests, handleRequest, getNotifications, updateBookStatus, deleteBookbyadmin
} from '../controllers/bookController.js';
;

const upload = require("../functions/multer.js");

const router = express.Router();


router.post('/addbook', verifyToken, upload.array('images', 5), addBook);
router.get('/getmybooks', verifyToken, getBooks);
router.put('/markassold/:id', verifyToken, markAsSold);
router.put('/toggleactive/:id', verifyToken, toggleActiveStatus);
router.get('/searchbook', searchBook);
router.get('/selectedBook/:id', selectedBook);
router.put('/addwishlist/:id', verifyToken, likeBook);
router.get("/getwishlist", verifyToken, getLikedBooks);
router.put('/updatebook/:id', verifyToken, upload.array('images', 5), editBook);
router.delete('/deletebook/:id', verifyToken, deleteBook);
router.post("/requestbid/:id", verifyToken, requestBook);
router.get("/getrequests", verifyToken, getRequests);
router.post("/handlerequest", verifyToken, handleRequest);
router.get('/notifications', verifyToken, getNotifications);
router.get('/global', verifyToken, getbooksglobaly);

// Admin routes
router.get('/admin/getnumberofbooks', verifyToken, getnumberofallbooks);
router.get('/admin/resentlyaddedbooks', verifyToken, recentlyAddedBooks);
router.get('/admin/getallbooks', verifyToken, getAllBooks);
router.put("/admin/updatestatus", verifyToken, updateBookStatus);
router.delete('/admin/deletebook/:bookId', verifyToken, deleteBookbyadmin);

export default router;
