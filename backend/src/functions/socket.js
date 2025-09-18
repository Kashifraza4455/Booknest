// src/functions/socket.js
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import ChatRoom from "../models/chatRoomSchema.js";
import User from "../models/usermodel.js";
import Notification from "../models/notificationSchema.js";

let io; // Socket.IO instance
const onlineUsers = new Map(); // Online users tracker

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // -------------------- USER JOIN --------------------
        socket.on("join_room", ({ userId }) => {
            if (!userId) return;
            const newUser = userId.toString();
            onlineUsers.set(newUser, { socketId: socket.id });
            console.log("onlineUsers", onlineUsers);
            socket.join(newUser);
        });

        // -------------------- UPLOAD FOLDER --------------------
        const uploadDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        // -------------------- SEND AUDIO MESSAGE --------------------
        socket.on("send_audio_message", async (formData) => {
            try {
                const { senderId, receiverId, audio } = formData;
                if (!audio) return socket.emit("error", { message: "No audio file provided" });

                const allowedTypes = ["audio/wav", "audio/mp3", "audio/mpeg"];
                if (!allowedTypes.includes(audio.mimetype)) {
                    return socket.emit("error", { message: "Invalid audio format" });
                }

                const audioName = `${Date.now()}-${senderId}.wav`;
                const audioPath = path.join(uploadDir, audioName);
                await audio.mv(audioPath); // if using express-fileupload
                const audioUrl = `/uploads/${audioName}`;

                let chatRoom = await ChatRoom.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId },
                        { sender: receiverId, receiver: senderId },
                    ],
                });

                if (!chatRoom) {
                    chatRoom = new ChatRoom({ sender: senderId, receiver: receiverId, messages: [] });
                    await chatRoom.save();
                }

                const newMessage = { user: senderId, message: null, audio: audioUrl, createdAt: new Date() };
                chatRoom.messages.push(newMessage);
                chatRoom.lastMessage = { user: senderId, message: "Voice message", audio: audioUrl, createdAt: new Date() };
                await chatRoom.save();

                io.to(receiverId).emit("received_message", newMessage);

                const updatedChatRoom = await ChatRoom.findById(chatRoom._id)
                    .populate("sender receiver")
                    .populate("lastMessage.user");

                io.to(senderId).emit("chat_room_updated", updatedChatRoom);
                io.to(receiverId).emit("chat_room_updated", updatedChatRoom);
            } catch (err) {
                console.error("Error sending audio message:", err);
            }
        });

        // -------------------- SEND TEXT / IMAGE MESSAGE --------------------
        socket.on("send_message", async ({ senderId, receiverId, message, image }) => {
            try {
                let imageUrl = null;
                if (image && typeof image === "string" && image.startsWith("data:image/")) {
                    const base64Data = image.split(",")[1];
                    const buffer = Buffer.from(base64Data, "base64");
                    const imageName = `${Date.now()}-${senderId}.jpg`;
                    const imagePath = path.join(uploadDir, imageName);
                    fs.writeFileSync(imagePath, buffer);
                    imageUrl = `/uploads/${imageName}`;
                }

                let chatRoom = await ChatRoom.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId },
                        { sender: receiverId, receiver: senderId },
                    ],
                });

                if (!chatRoom) {
                    chatRoom = new ChatRoom({ sender: senderId, receiver: receiverId, messages: [] });
                    await chatRoom.save();
                }

                const sender = await User.findById(senderId);
                const newMessage = { user: sender, message, image: imageUrl, createdAt: new Date() };
                chatRoom.messages.push(newMessage);
                chatRoom.lastMessage = { user: senderId, message, image: imageUrl, createdAt: new Date() };
                await chatRoom.save();

                io.to(receiverId).emit("received_message", newMessage);
                io.to(senderId).emit("received_message", newMessage);

                const updatedChatRoom = await ChatRoom.findById(chatRoom._id)
                    .populate("sender receiver")
                    .populate("lastMessage.user");

                io.to(receiverId).emit("newMessage", `New message from ${updatedChatRoom.sender.firstname}: ${message}`);
                io.to(senderId).emit("chat_room_updated", updatedChatRoom);
                io.to(receiverId).emit("chat_room_updated", updatedChatRoom);

                // -------------------- SEND NOTIFICATION --------------------
                const newNotification = new Notification({
                    title: "Message Notification",
                    sender: senderId,
                    receiver: receiverId,
                    type: "others",
                    message: "You have a new message",
                });
                await newNotification.save();
                const populatedNotification = await Notification.findById(newNotification._id).populate("sender receiver");
                io.to(receiverId.toString()).emit("receive_notification", populatedNotification);

            } catch (err) {
                console.error("Error sending message:", err);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // -------------------- GET CHAT ROOMS --------------------
        socket.on("get_chat_rooms", async (userId) => {
            try {
                const chatRooms = await ChatRoom.find({
                    $or: [{ sender: userId }, { receiver: userId }],
                }).populate("sender receiver").populate("lastMessage.user");
                socket.emit("chat_rooms", chatRooms);
            } catch (err) {
                console.error("Error getting chat rooms:", err);
            }
        });

        // -------------------- CREATE CHAT ROOM --------------------
        socket.on("create_chat_room", async ({ senderId, receiverId }) => {
            try {
                let chatRoom = await ChatRoom.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId },
                        { sender: receiverId, receiver: senderId },
                    ],
                });

                if (!chatRoom) {
                    chatRoom = new ChatRoom({ sender: senderId, receiver: receiverId, messages: [] });
                    await chatRoom.save();
                }

                const updatedChatRoom = await ChatRoom.findById(chatRoom._id)
                    .populate("sender receiver")
                    .populate("lastMessage.user");

                io.to(senderId).emit("chat_room_updated", updatedChatRoom);
                io.to(receiverId).emit("chat_room_updated", updatedChatRoom);

            } catch (err) {
                console.error("Error creating chat room:", err);
            }
        });

        // -------------------- GET CHAT ROOM MESSAGES --------------------
        socket.on("get_chat_room_messages", async (roomId) => {
            try {
                const chatRoom = await ChatRoom.findById(roomId).populate("sender receiver").populate("messages.user");
                if (!chatRoom) return socket.emit("error", { message: "Chat room not found" });
                socket.emit("chat_room_messages", chatRoom.messages);
            } catch (err) {
                console.error("Error getting chat room messages:", err);
            }
        });

        // -------------------- DISCONNECT --------------------
        socket.on("disconnect", () => {
            for (const [userId, userInfo] of onlineUsers.entries()) {
                if (userInfo.socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });

    });
};

// -------------------- EXPORT CUSTOM EMIT FUNCTIONS --------------------
export const sendNotification = (socketId, event, data) => {
    if (io) io.to(socketId).emit(event, data);
};

export const emitData = (socketId, event, data) => {
    if (io) io.to(socketId).emit(event, data);
};
