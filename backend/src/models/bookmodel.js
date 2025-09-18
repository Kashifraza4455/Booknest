import mongoose from "mongoose";

// book schema
const bookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, default: "Title" },
  author: { type: String, default: "Author" },
  condition: { type: String, enum: ["New", "Used"], default: "Condition" },
  websiteUrl: { type: String, default: "WebsiteUrl" },
  genre: { type: String, enum: ["Fiction", "Non-Fiction", "Mystery", "Science", "Biography", "others"], default: "Genre" },
  price: { type: Number, default: 0 },
  images: [{ type: String }],
  imageFileName: { type: String, default: null },
  description: { type: String, default: "Description" },
  isreqaccepted: { type: Boolean, default: false },
  reqacceptedof: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  year: { type: String, default: "Year" },
  isActive: { type: Boolean, default: true },
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isSold: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  stripeAccountId: { type: String },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shippingAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Book = mongoose.model("Book", bookSchema);

export default Book;  // ✅ ESM default export
