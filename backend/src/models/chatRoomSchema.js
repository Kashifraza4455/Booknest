import mongoose from "mongoose";

const chatRoomsSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
      message: { type: String },
      image: { type: String },
      audio: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  lastMessage: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    message: { type: String },
    image: { type: String },
    audio: { type: String },
    createdAt: { type: Date },
  },
  unreadCount: { type: Number, default: 0 },
}, { timestamps: true });

// Create unique index for sender and receiver to prevent duplicate chat rooms
chatRoomsSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const ChatRoom = mongoose.model("ChatRoom", chatRoomsSchema);
export default ChatRoom;  // ✅ ESM export
