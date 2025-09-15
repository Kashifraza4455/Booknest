// book controller multer is defined in another file

const Book = require('../models/bookmodel');
const User = require('../models/usermodel');
const upload = require('../functions/multer');
const transporter = require('../middleware/transporter');// for sending email
const { emitData, sendNotification } = require('../functions/socket');
const Notification = require('../models/notificationSchema');
const ChatRoom = require('../models/chatRoomSchema');
const dotenv = require('dotenv')
dotenv.config();

let deletebookcounter = 0;


//addboookkkkkk
exports.addBook = async (req, res) => {
    const { title, genre, price, description, websiteUrl, author, condition, year } = req.body;
    console.log(req.body);
    try {
        const user = await User.findById(req.user.id);
       

        // handle images
        const Cimages = req.files.map(file => file.path);

        // Save product details in MongoDB
        const newBook = await Book.create({
            user: req.user.id,
            title,
            genre,
            price,
            images: Cimages,
            description,
            websiteUrl, author, condition, year
         
        });

        // Send email using transporter
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Book Added",
            html: `
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333;">Book Added</h1>
                    <p style="color: #666; margin: 20px 0;">Your book ${title} has been added successfully</p>
                </div>
            </div>
            `   
        }); 
        res.status(201).json({ message: 'Book added successfully', data: newBook });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//get all books of a user
exports.getBooks = async (req, res) => {
    try {
        const filter = { user: req.user.id };

        if (req.query.paused === 'true') filter.isActive = false;
        if (req.query.sold === 'true') filter.isSold = true;
        if (req.query.active === 'true') filter.isActive = true;
        if (req.query.rejected === 'true') filter.status = 'Rejected';
        if (req.query.approved === 'true') filter.status = 'Approved';
        if (req.query.pending === 'true') filter.status = 'Pending';

        const books = await Book.find(filter).populate('likes', 'firstname lastname phoneno email').populate('user', 'firstname lastname phoneno email');
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update is sold
exports.markAsSold = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
        if (!book) return res.status(404).json({ message: 'Book not found' });

        book.isSold = true;

        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Book Sold",
            html: `
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333;">Book Sold</h1>
                    <p style="color: #666; margin: 20px 0;">Your book ${book.title} has been sold successfully</p>
                </div>
            </div>
            `
        });

        // Notify all users who requested this book
        const requestingUsers = await User.find({
            'sentrequests.book': book._id,
            'sentrequests.status': 'Pending'
        });

        const notificationPromises = requestingUsers.map(async (requester) => {
            const notification = {
                title: "Book Sold",
                sender: req.user.id,
                receiver: requester._id,
                type: "book",
                message: `The book "${book.title}" you requested has been sold`,
            };
            await Notification.create(notification);
            sendNotification(requester._id, "notification", notification);
        });

        await Promise.all(notificationPromises);

        await book.save();
        res.status(200).json({ message: 'Book marked as sold', data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// exports.markAsSold = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
//         if (!book) return res.status(404).json({ message: 'Book not found' });

//         book.isSold = true;

//         await transporter.sendMail({
//             from: process.env.SENDER_MAIL,
//             to: user.email,
//             subject: "Book Sold",
//             text: `Your book ${book.title} has been sold successfully`
//         });

//         await book.save();
//         res.status(200).json({ message: 'Book marked as sold', data: book });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


//toggle active status
exports.toggleActiveStatus = async (req, res) => {
    const { isActive } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const active = isActive === "true" || isActive === true;
        book.isActive = active;

        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: active ? "Book Activated" : "Book Paused",
            html: `
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333;">Book ${active ? 'Activated' : 'Paused'}</h1>
                    <p style="color: #666; margin: 20px 0;">Your book ${book.title} has been ${active ? 'activated' : 'paused'} successfully</p>
                </div>
            </div>
            `
        });

        // Notify all users who liked this book
        if (book.likes.length > 0) {
            const notificationPromises = book.likes.map(async (likerId) => {
                const notification = {
                    title: "Book Status Update",
                    sender: req.user.id,
                    receiver: likerId,
                    type: "book",
                    message: `The book "${book.title}" you liked has been ${active ? 'activated' : 'paused'}`,
                };
                await Notification.create(notification);
                sendNotification(likerId, "notification", notification);
            });
            
            await Promise.all(notificationPromises);
        }

        await book.save();
        res.status(200).json({ message: `Book ${active ? 'activated' : 'paused'} successfully`, data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// exports.toggleActiveStatus = async (req, res) => {
//     const { isActive } = req.body; // expects true/false (as boolean or string)

//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
//         if (!book) return res.status(404).json({ message: 'Book not found' });

//         const active = isActive === "true" || isActive === true;

//         book.isActive = active;

//         await transporter.sendMail({
//             from: process.env.SENDER_MAIL,
//             to: user.email,
//             subject: active ? "Book Activated" : "Book Paused",
//             text: `Your book ${book.title} has been ${active ? 'activated' : 'paused'} successfully`
//         });

//         await book.save();
//         res.status(200).json({ message: `Book ${active ? 'activated' : 'paused'} successfully`, data: book });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// active/pause toggle book status


//like book, push likers' id to likes array
exports.likeBook = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const book = await Book.findOne({ _id: req.params.id }).populate('user');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const bookOwner = book.user;
        const action = book.likes.includes(req.user.id) ? 'unliked' : 'liked';

        if (book.likes.includes(req.user.id)) {
            book.likes.pull(req.user.id);
            await book.save();
            
            // Notification for unlike
            const notification = {
                title: "Book Interaction",
                sender: req.user.id,
                receiver: bookOwner._id,
                type: "book",
                message: `${user.firstname} ${user.lastname} unliked your book "${book.title}"`,
            };
            await Notification.create(notification);
            sendNotification(bookOwner._id, "notification", notification);

            return res.status(200).json({ message: 'Book unliked successfully', data: book });
        }

        book.likes.push(req.user.id);
        await book.save();

        // Notification for like
        const notification = {
            title: "Book Interaction",
            sender: req.user.id,
            receiver: bookOwner._id,
            type: "book",
            message: `${user.firstname} ${user.lastname} liked your book "${book.title}"`,
        };
        await Notification.create(notification);
        sendNotification(bookOwner._id, "notification", notification);

        res.status(200).json({ message: 'Book liked successfully', data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// exports.likeBook = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const book = await Book.findOne({ _id: req.params.id }).populate('user');
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }
//         // check if user has already liked the book
//         if (book.likes.includes(req.user.id)) {
//             //pull the user id from likes array
//             book.likes.pull(req.user.id);
//             await book.save();
//             return res.status(200).json({ message: 'Book unliked successfully', data: book });
//         }
//         //push the user id to likes array
//         book.likes.push(req.user.id);
//         await book.save();
//         res.status(200).json({ message: 'Book liked successfully', data: book });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

//get liked books
exports.getLikedBooks = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const books = await Book.find({ likes: req.user.id }).populate('user', 'firstname lastname phoneno email');
        if (!books) {
            return res.status(404).json({ message: 'No liked books found' });
        }
        res.status(200).json({ wishlistBooks: books, message: 'Books fetch successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//searchbook by title and genre using regex for case insensitivity pasing query params
exports.searchBook = async (req, res) => {
    const { title, genre } = req.query;
    try {

        //searching from all books
        if (genre == "All") {
            const books = await Book.find({
                title: { $regex: new RegExp(title, 'i') }
            });
            return res.status(200).json(books);
        }

        //searching from specific genre
        const books = await Book.find({
            title: { $regex: new RegExp(title, 'i') },
            genre: { $regex: new RegExp(genre, 'i') }
        });
        res.status(200).json(books);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// selected Book By ID 
exports.selectedBook = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findById(id).populate('user');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Fetch 5 more books of the same user excluding the current one
        const moreBooks = await Book.find({
            user: book.user._id,
            _id: { $ne: id } // Exclude the selected book
        })
            .limit(5)
            .populate('user', 'firstname lastname phoneno email');

        res.status(200).json({
            message: 'Book fetched successfully',
            selected: book,
            moreBooks: moreBooks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//edit books, all fields are optional
exports.editBook = async (req, res) => {
    const { title, genre, price, description, websiteUrl, author, condition, year } = req.body;
    console.log(req.body, 'Edit data ocming')
    console.log(req.file, 'File coming')
    console.log(req.files, 'Files coming')
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const book = await Book.findOne({ _id: req.params.id, user: req.user.id });


        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (title) {
            book.title = title;
        }
        if (genre) {
            book.genre = genre;
        }
        if (price) {
            book.price = price;
        }
        //req.file or req.files for multiple images
        if (req.file || req.files) {
            const Cimages = req.files.map(file => file.path);
            book.images = Cimages;
        }
        if (description) {
            book.description = description;
        }
        if (websiteUrl) {
            book.websiteUrl = websiteUrl;
        }
        if (author) {
            book.author = author;
        }
        if (condition) {
            book.condition = condition;
        }
        if (year) {
            book.year = year;
        }
        //send mail to user
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Book Updated",
            html: `
            <div style="background-color: #f6f6f6; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <h1 style="color: #333;">Book Updated</h1>
                    <p style="color: #666; margin: 20px 0;">Your book ${book.title} has been updated successfully</p>
                </div>
            </div>
            `
        });
        //save book
        await book.save();
        res.status(200).json({ message: 'Book updated successfully', data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Backend controller me
exports.getbooksglobaly = async (req, res) => {
  try {
    const books = await Book.find(); // ya jo bhi query se 16 books lana chahte ho
    res.status(200).json({ books }); // frontend me res.data.books se access karenge
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




//delete book by user
exports.deleteBook = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        await book.deleteOne();
        deletebookcounter++;

        //send mail to user
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Book Deleted",
            text: `Your book ${book.title} has been deleted successfully`
        });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//request bid
exports.requestBook = async (req, res) => {
    try {
        const { amount } = req.body;
        const buyerId = req.user.id; // Make sure req.user is set by authentication middleware
        const bookId = req.params.id;

        // Find the book and its owner
        const book = await Book.findById(bookId).populate("user");
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const sellerId = book.user._id.toString(); // ✅ Extract the _id from populated user

        if (buyerId === sellerId) {
            return res.status(400).json({ message: "You cannot bid on your own book" });
        }

        // Find or create a chat room
        let chatRoom = await ChatRoom.findOneAndUpdate(
            {
                $or: [
                    { sender: buyerId, receiver: sellerId },
                    { sender: sellerId, receiver: buyerId }
                ]
            },
            {
                $setOnInsert: {
                    sender: buyerId,
                    receiver: sellerId,
                    messages: [],
                    unreadCount: 0
                }
            },
            { new: true, upsert: true }
        );

        // Create and push the message
        const messageDoc = {
            user: buyerId,
            book: bookId,
            message: `Bid Amount: $${amount}`,
            createdAt: new Date()
        };

        chatRoom.messages.push(messageDoc);
        chatRoom.lastMessage = messageDoc;
        chatRoom.unreadCount += 1;
        await chatRoom.save();

        // Notify via socket
        emitData(sellerId, "received_message", messageDoc);
        emitData(sellerId, "chat_room_updated", chatRoom);
        emitData(buyerId, "chat_room_updated", chatRoom);

        // Create notification
        const notification = {
            title: "Bid Request",
            sender: buyerId,
            receiver: sellerId,
            type: "book",
            message: `Bid Request for ${book.title} with amount $${amount}`,
        };
        await Notification.create(notification);
        sendNotification(sellerId, "notification", notification);

        // Update sent and received requests
        const buyer = await User.findById(buyerId);
        const seller = await User.findById(sellerId);

        const existingSent = buyer.sentrequests.find(req =>
            req.to?.toString() === seller._id.toString() && req.book?.toString() === bookId
        );

        if (!existingSent) {
            buyer.sentrequests.push({
                to: sellerId,
                book: bookId,
                status: 'Pending'
            });
            await buyer.save();
        }

        const existingRequest = seller.receivedrequests.find(req =>
            req.user?.toString() === buyerId && req.book?.toString() === bookId
        );

        if (!existingRequest) {
            seller.receivedrequests.push({
                user: buyerId,
                book: bookId,
                status: 'Pending'
            });
            await seller.save();
        }


        return res.status(200).json({ message: "Bid request sent successfully", chatRoom });
    } catch (error) {
        console.error("Error in requestBook:", error);
        return res.status(500).json({ message: error.message });
    }
};



//admin routes
//number of books list, deleted, active & approved, pending
exports.getnumberofallbooks = async (req, res) => {
    try {
        const currentuser = await User.findById(req.user.id);
        if (!currentuser.isadmin) {
            return res.status(403).json({ message: 'You are not authorized to acces this route' });
        }

        const totalbooks = await Book.countDocuments({ isActive: true, isSold: false });
        const deletedbooks = deletebookcounter;

        res.status(200).json({ totalbooks, deletedbooks, activebooks, approvedbooks, pendingbooks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//recently added books upto 5
exports.recentlyAddedBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        //finding user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.isadmin) {
            return res.status(403).json({ message: 'You are not authorized' });
        }

        const books = await Book.find({}).sort({ createdAt: -1 }).limit(5);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//get all books
exports.getAllBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isadmin) {
            return res.status(403).json({ message: 'You are not authorized' });
        }

        const { query, status, page = 1, limit = 4 } = req.query;
        console.log(req.query);
        const regex = query ? new RegExp(query, "i") : null;
        const filter = {};

        // Search condition
        if (regex) {
            filter.$or = [
                { title: regex },
                { genre: regex }
            ];
        }

        // Status filter
        if (status) {
            filter.status = status
        }


        const skip = (page - 1) * limit;

        const books = await Book.find(filter)
            .populate('user', 'firstname lastname phoneno email address',)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Optional: latest first

        const totalBooks = await Book.countDocuments(filter);
        const totalPages = Math.ceil(totalBooks / limit);

        res.status(200).json({
            currentPage: Number(page),
            totalPages,
            totalBooks,
            books
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//update rejected/accepted book status by admin
exports.updateBookStatus = async (req, res) => {
    try {
        const userId = req.user.id;
       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.isadmin) {
            return res.status(403).json({ message: 'You are not authorized' });
        }
        const { status, bookId } = req.body;
        console.log(req.body);
        // const bookId = req.params.id;
        const book = await Book.findById(bookId).populate('user', 'email');;
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        book.status = status;
        console.log(status);
        await book.save();
       
        //send mail to user
        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: book.user.email,
            subject: "Book Status Updated",
            text: `Your book ${book.title} has been ${status}.`
        });
        res.status(200).json({ message: 'Book status updated successfully', data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//delete book by admin
exports.deleteBookbyadmin = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.isadmin) {
            return res.status(403).json({ message: 'You are not authorized' });
        }
        const book = await Book.findByIdAndDelete(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully', data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get both sent and received requests
exports.getRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate({
                path: 'sentrequests',
                populate: [
                    {
                        path: 'to',
                        model: 'User',
                        select: 'firstname lastname phoneno email'
                    },
                    {
                        path: 'book',
                        model: 'Book',
                        select: 'title genre price description images websiteUrl author condition year'
                    }
                ]
            })

            .populate({
                path: 'receivedrequests',
                populate: [
                    {
                        path: 'user',
                        model: 'User',
                        select: 'firstname lastname phoneno email'
                    },
                    {
                        path: 'book',
                        model: 'Book',
                        select: 'title genre price description images websiteUrl author condition year'
                    }
                ]
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            sentRequests: user.sentrequests,
            receivedRequests: user.receivedrequests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//accept request
// Handle both accept and reject requests
// exports.handleRequest = async (req, restoggleActiveStatus) => {
//     console.log(req.body, 'Request body coming')
//     console.log(req.user, 'User coming')
//     try {
//         const receiverId = req.user.id; // The user who is accepting/rejecting the request
//         const { requesterId, bookId, status } = req.body; // status will be 'Accepted' or 'Rejected'

//         if (status !== 'Accepted' && status !== 'Rejected') {
//             return res.status(400).json({ message: 'Invalid status, it should be either "Accepted" or "Rejected"' });
//         }

//         const receiver = await User.findById(receiverId);
//         const requester = await User.findById(requesterId);

//         if (!receiver || !requester) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update status in receiver's receivedrequests
//         const receivedRequest = receiver.receivedrequests.find(
//             (r) => r.user.toString() === requesterId && r.book.toString() === bookId
//         );
//         if (receivedRequest) {
//             receivedRequest.status = status;
//         } else {
//             return res.status(404).json({ message: 'Request not found in receiver\'s list' });
//         }

//         // Update status in requester's sentrequests
//         const sentRequest = requester.sentrequests.find(
//             (r) => r.to.toString() === receiverId && r.book.toString() === bookId
//         );
//         if (sentRequest) {
//             sentRequest.status = status;
//         } else {
//             return res.status(404).json({ message: 'Request not found in requester\'s list' });
//         }

//         await receiver.save();
//         await requester.save();

        
//         const notification = {
//             title: " Book Status Updated",
//             sender: requesterId,
//             receiver: receiverId,
//             type: "book",
//             message: `Your Book Request Title: has been ${status}`,
//         };
//         await Notification.create(notification);
//         // sendNotification(sellerId, "notification", notification);



//         res.status(200).json({ message: `Request ${status.toLowerCase()} successfully` });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
exports.handleRequest = async (req, res) => {
    console.log(req.body, 'Request body coming')
    console.log(req.user, 'User coming')
    try {
        const receiverId = req.user.id; // The user who is accepting/rejecting the request
        const { requesterId, bookId, status } = req.body; // status will be 'Accepted' or 'Rejected'

        if (status !== 'Accepted' && status !== 'Rejected') {
            return res.status(400).json({ message: 'Invalid status, it should be either "Accepted" or "Rejected"' });
        }

        const receiver = await User.findById(receiverId);
        const requester = await User.findById(requesterId);
        const book = await Book.findById(bookId);

        if (!receiver || !requester || !book) {
            return res.status(404).json({ message: 'User or book not found' });
        }

        // Update status in receiver's receivedrequests
        const receivedRequest = receiver.receivedrequests.find(
            (r) => r.user.toString() === requesterId && r.book.toString() === bookId
        );
        if (receivedRequest) {
            receivedRequest.status = status;
        } else {
            return res.status(404).json({ message: 'Request not found in receiver\'s list' });
        }

        // Update status in requester's sentrequests
        const sentRequest = requester.sentrequests.find(
            (r) => r.to.toString() === receiverId && r.book.toString() === bookId
        );
        if (sentRequest) {
            sentRequest.status = status;
        } else {
            return res.status(404).json({ message: 'Request not found in requester\'s list' });
        }

        await receiver.save();
        await requester.save();

        // Create notification for requester
        const notification = {
            title: "Book Request Update",
            sender: receiverId,
            receiver: requesterId,
            type: "book",
            message: `${receiver.firstname} ${receiver.lastname} has ${status.toLowerCase()} your request for "${book.title}"`,
        };
        console.log(notification, 'Request Notification')
        await Notification.create(notification);
        sendNotification(requesterId, "notification", notification);

        res.status(200).json({ message: `Request ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const notifications = await Notification.find({ receiver : userId }).sort({ createdAt: -1 })
        .populate('sender')
        if(!notifications) {
            return res.status(404).json({ message: 'No notifications found' });
        }
        console.log(notifications, 'Notifications coming')
        res.status(200).json({message : "notification fetch successfully", notifications});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

