//bookmodel
const mongoose = require('mongoose');

//book schema
const bookSchema = new mongoose.Schema({


    //user who added the book
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true
        },

    //book details
    title: {
        type: String,
        // required: true,
        default: 'Title'
    },
    author : {
        type: String,
        // required: true,
        default: 'Author'
    },
    condition : {
        type: String,
        // required: true,
        enum: ['New', 'Used'],
        default: 'Condition'
    },
        websiteUrl :{
        type: String,
        // required: true,
        default: 'WebsiteUrl'
        },
    //category of book
    genre: {
        type: String,
        // required: true,
        enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Science', 'Biography','others'],
        default: 'Genre'
    },

    //price of book
    price: {
        type: Number,
        // required: true,
        default: 0
    },

    //book images
    images: [{
        type: String,
        // required: true,
    }],


    //book description
    description: {
        type: String,
        // required: true,
        default: 'Description'
    },

    //request accepted or not boolean
    isreqaccepted: {
        type: Boolean,
        default: false
    },

    //whose request is accepted
    reqacceptedof: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },


    //book status (Pending, Approved, Rejected) by admin
    status: {
        type: String,
        // required: true,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    year :{
        type: String,
        // required: true,
        default: 'Year'
    },


    //active or paused by user
    isActive: {
        type: Boolean,
        default: true
    },
    requests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    //sold or not sold by user
    isSold: {
        type: Boolean,
        default: false
    },
    //saving ids of users who liked the book
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    //saving ids of users who added the book to cart
    // stripeProductId: {
    //     type: String,
    //     required: true
    // },
    //saving ids of users who added the book to cart
    // stripePriceId: {
    //     type: String,
    //     required: true
    // },
    //seller stripe account
    stripeAccountId: {
        type: String,
        // required: true
    },

    //buyer id
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    //shipping address
    shippingAddress: {
        type: String
    },

    //timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
}, 

//timestamps
{
    timestamps: true
});


const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
