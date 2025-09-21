import dotenv from "dotenv";
dotenv.config();

import Book from "../models/bookmodel.js";
import User from "../models/usermodel.js";
import Notification from "../models/notificationSchema.js";
import ChatRoom from "../models/chatRoomSchema.js";

import transporter from "../middleware/transporter.js";
import { emitData, sendNotification } from "../functions/socket.js";
import upload from "../functions/multer.js"; // multer ko ESM style me import


// ----------------- User Functions ------------------
export const getLikedBooks = async (req, res) => {
    try {
        const books = await Book.find({ likes: req.user.id }).populate('user', 'firstname lastname phoneno email');
        res.status(200).json({ wishlistBooks: books, message: 'Books fetch successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Book
export const addBook = async (req, res) => {
  const { title, genre, price, description, websiteUrl, author, condition, year } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const Cimages = req.files.map(file => file.path);

    const newBook = await Book.create({
      user: req.user.id,
      title,
      genre,
      price,
      images: Cimages,
      description,
      websiteUrl,
      author,
      condition,
      year
    });

    await transporter.sendMail({
      from: process.env.SENDER_MAIL,
      to: user.email,
      subject: "Book Added",
      html: `
        <div style="background-color:#f6f6f6;padding:20px;">
          <div style="background-color:white;padding:20px;border-radius:10px;text-align:center;">
            <h1>Book Added</h1>
            <p>Your book ${title} has been added successfully</p>
          </div>
        </div>`
    });

    res.status(201).json({ message: 'Book added successfully', data: newBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Books
export const getBooks = async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.paused === 'true') filter.isActive = false;
    if (req.query.sold === 'true') filter.isSold = true;
    if (req.query.active === 'true') filter.isActive = true;
    if (req.query.rejected === 'true') filter.status = 'Rejected';
    if (req.query.approved === 'true') filter.status = 'Approved';
    if (req.query.pending === 'true') filter.status = 'Pending';

    const books = await Book.find(filter)
      .populate('likes', 'firstname lastname phoneno email')
      .populate('user', 'firstname lastname phoneno email');

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Book as Sold
export const markAsSold = async (req, res) => {
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
        <div style="background-color:#f6f6f6;padding:20px;">
          <div style="background-color:white;padding:20px;border-radius:10px;text-align:center;">
            <h1>Book Sold</h1>
            <p>Your book ${book.title} has been sold successfully</p>
          </div>
        </div>`
    });

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

// Toggle Active Status
export const toggleActiveStatus = async (req, res) => {
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
        <div style="background-color:#f6f6f6;padding:20px;">
          <div style="background-color:white;padding:20px;border-radius:10px;text-align:center;">
            <h1>Book ${active ? 'Activated' : 'Paused'}</h1>
            <p>Your book ${book.title} has been ${active ? 'activated' : 'paused'} successfully</p>
          </div>
        </div>`
    });

    if (book.likes.length > 0) {
      const notifications = book.likes.map(async (likerId) => {
        const notification = {
          title: "Book Status Update",
          sender: req.user.id,
          receiver: likerId,
          type: "book",
          message: `The book "${book.title}" you liked has been ${active ? 'activated' : 'paused'}`
        };
        await Notification.create(notification);
        sendNotification(likerId, "notification", notification);
      });
      await Promise.all(notifications);
    }

    await book.save();
    res.status(200).json({ message: `Book ${active ? 'activated' : 'paused'} successfully`, data: book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like / Unlike Book
export const likeBook = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const book = await Book.findById(req.params.id).populate('user');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const bookOwner = book.user;

    if (book.likes.includes(req.user.id)) {
      book.likes.pull(req.user.id);
      await book.save();

      const notification = {
        title: "Book Interaction",
        sender: req.user.id,
        receiver: bookOwner._id,
        type: "book",
        message: `${user.firstname} ${user.lastname} unliked your book "${book.title}"`
      };
      await Notification.create(notification);
      sendNotification(bookOwner._id, "notification", notification);

      return res.status(200).json({ message: 'Book unliked successfully', data: book });
    }

    book.likes.push(req.user.id);
    await book.save();

    const notification = {
      title: "Book Interaction",
      sender: req.user.id,
      receiver: bookOwner._id,
      type: "book",
      message: `${user.firstname} ${user.lastname} liked your book "${book.title}"`
    };
    await Notification.create(notification);
    sendNotification(bookOwner._id, "notification", notification);

    res.status(200).json({ message: 'Book liked successfully', data: book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search Book
export const searchBook = async (req, res) => {
    const { title, genre } = req.query;
    try {
        let books;
        if (genre === "All") {
            books = await Book.find({ title: { $regex: new RegExp(title, 'i') } });
        } else {
            books = await Book.find({
                title: { $regex: new RegExp(title, 'i') },
                genre: { $regex: new RegExp(genre, 'i') }
            });
        }
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Selected Book
export const selectedBook = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findById(id).populate('user');
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const moreBooks = await Book.find({ user: book.user._id, _id: { $ne: id } })
            .limit(5)
            .populate('user', 'firstname lastname phoneno email');

        res.status(200).json({ message: 'Book fetched successfully', selected: book, moreBooks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit Book
export const editBook = async (req, res) => {
    const { title, genre, price, description, websiteUrl, author, condition, year } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
        if (!book) return res.status(404).json({ message: 'Book not found' });

        if (title) book.title = title;
        if (genre) book.genre = genre;
        if (price) book.price = price;
        if (req.files && req.files.length > 0) book.images = req.files.map(f => f.path);
        if (description) book.description = description;
        if (websiteUrl) book.websiteUrl = websiteUrl;
        if (author) book.author = author;
        if (condition) book.condition = condition;
        if (year) book.year = year;

        await transporter.sendMail({
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Book Updated",
            html: `<div style="background-color:#f6f6f6;padding:20px;">
                    <div style="background-color:white;padding:20px;border-radius:10px;text-align:center;">
                        <h1>Book Updated</h1>
                        <p>Your book ${book.title} has been updated successfully</p>
                    </div>
                </div>`
        });

        await book.save();
        res.status(200).json({ message: 'Book updated successfully', data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Books Globally
export const getbooksglobaly = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json({ books });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ----------------- Admin Functions ------------------

// Delete Book
export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Book Status (Admin)
export const updateBookStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        book.status = status;
        await book.save();

        res.status(200).json({ message: `Book status updated to ${status}`, data: book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Book by Admin
export const deleteBookbyadmin = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json({ message: 'Book deleted successfully by admin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Requests
export const getRequests = async (req, res) => {
    try {
        const requests = await User.find({ "sentrequests.status": "Pending" }).populate("sentrequests.book");
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Handle Request (Admin)
export const handleRequest = async (req, res) => {
    const { status } = req.body;
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const request = user.sentrequests.id(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        await user.save();

        res.status(200).json({ message: `Request ${status}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user.id });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
