const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookcontroller');
const verifyToken = require('../middleware/authmiddleware');
const upload = require('../functions/multer');

router.post('/addbook', verifyToken, upload.array('images', 5) ,bookController.addBook); // add book by user DONE
router.get('/getmybooks', verifyToken, bookController.getBooks); // get all books of user DONE
router.put('/markassold/:id', verifyToken, bookController.markAsSold); // mark book as sold by user DONE
router.put('/toggleactive/:id', verifyToken, bookController.toggleActiveStatus); // toggle book active status by user DONE
router.get('/searchbook', bookController.searchBook); // search book by title
router.get('/selectedBook/:id', bookController.selectedBook); // search book by title
router.put('/addwishlist/:id', verifyToken, bookController.likeBook); // when user like the book DONE
router.get("/getwishlist", verifyToken, bookController.getLikedBooks); // get wishlist of user DONE
router.put('/updatebook/:id', verifyToken, upload.array('images', 5), bookController.editBook);// update book by user DONE
router.get('/getbooks', verifyToken, bookController.getbooksglobaly); // get all books of all users  DONE
router.delete('/deletebook/:id', verifyToken, bookController.deleteBook); // delete book by user DONE
router.post("/requestbid/:id", verifyToken, bookController.requestBook); // request book by user DONE
router.get("/getrequests", verifyToken, bookController.getRequests); // get all requests of user DONE
router.post("/handlerequest", verifyToken, bookController.handleRequest); // handle request by user DONE
router.get('/notifications',verifyToken, bookController.getNotifications);


// //admin routes
router.get('/admin/getnumberofbooks', verifyToken, bookController.getnumberofallbooks); // get all books
router.get('admin/resentlyaddedbooks', verifyToken, bookController.recentlyAddedBooks); // get recently added books
router.get('/admin/getallbooks', verifyToken, bookController.getAllBooks); // get all books DONE
router.put("/admin/updatestatus", verifyToken, bookController.updateBookStatus); // update book status by admin DONE
router.delete('/admin/deletebook/:bookId', verifyToken, bookController.deleteBookbyadmin); // delete book by admin DONE



module.exports = router;
// ✅ Use the middleware in the routes