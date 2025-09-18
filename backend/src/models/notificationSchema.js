import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['social', 'book', 'others'], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Text index for search
notificationSchema.index({ title: "text", message: "text" });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;  // ✅ ESM export
