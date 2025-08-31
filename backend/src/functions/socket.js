const SocketIo = require("socket.io");
const fs = require('fs');
const path = require('path');
const ChatRoom = require('../models/chatRoomSchema'); // Adjust the path to your model
const User = require('../models/usermodel'); // Adjust the path to your model
const Notification = require('../models/notificationSchema');


let io; // To store Socket.IO instance
const onlineUsers = new Map(); // To track online users

const initSocket = (server) => {
    io = SocketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {

        // Handle user joining
        socket.on("join_room", ({ userId }) => {
            if (!userId) {
                return;
            }

            const newUser = userId.toString();
            onlineUsers.set(newUser, { socketId: socket.id });
            console.log("onlineUsers", onlineUsers);

            socket.join(newUser);
        });


        // Define where images will be stored
        const uploadDir = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }



        socket.on("send_audio_message", async (formData) => {  // formData is an object containing senderId, receiverId, and audio file
            try {
                const { senderId, receiverId } = formData;
                const audioFile = formData.audio; // This is the file uploaded from the client

                if (!audioFile) {
                    return socket.emit("error", { message: "No audio file provided" });
                }

                // Validate if the file is a valid audio type
                const allowedTypes = ["audio/wav", "audio/mp3", "audio/mpeg"];
                if (!allowedTypes.includes(audioFile.mimetype)) {
                    return socket.emit("error", { message: "Invalid audio format" });
                }

                // Save the audio file
                const audioName = `${Date.now()}-${senderId}.wav`; // You can change the format if necessary
                const audioPath = path.join(uploadDir, audioName);
                console.log('Saving audio to:', audioPath);

                try {
                    await audioFile.mv(audioPath); // Use a method like 'mv' for file upload (if using `express-fileupload` or other methods)
                } catch (err) {
                    console.error("Error saving audio:", err);
                    return socket.emit("error", { message: "Failed to save audio" });
                }

                // Store audio file URL
                const audioUrl = `/uploads/${audioName}`;

                // Find or create chat room
                let chatRoom = await ChatRoom.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId },
                        { sender: receiverId, receiver: senderId }
                    ]
                });

                if (!chatRoom) {
                    chatRoom = new ChatRoom({
                        sender: senderId,
                        receiver: receiverId,
                        messages: [],
                    });
                    await chatRoom.save();
                    console.log(`New chat room created between ${senderId} and ${receiverId}`);
                }

                // Add the new voice message
                const newMessage = {
                    user: senderId,
                    message: null, // No text message
                    audio: audioUrl, // The URL to the audio file
                    createdAt: new Date(),
                };

                chatRoom.messages.push(newMessage);

                // Update the last message
                chatRoom.lastMessage = {
                    user: senderId,
                    message: "Voice message", // You can customize this if you want
                    audio: audioUrl,
                    createdAt: new Date(),
                };

                await chatRoom.save();
                console.log('Chat room updated successfully with new audio message');

                // Emit message to receiver
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

        socket.on("send_message", async ({ senderId, receiverId, message, image }) => {
            try {
                console.log("senderId", senderId, "receiverId", receiverId, "message", message);
                console.log("image", image);

                // Handle image upload
                let imageUrl = null;
                if (image) {
                    // Validate if the image is a valid base64 string
                    if (typeof image === 'string' && image.startsWith('data:image/')) {
                        const base64Data = image.split(',')[1]; // Extract base64 content
                        const buffer = Buffer.from(base64Data, 'base64'); // Convert to Buffer

                        // Save the image
                        const imageName = `${Date.now()}-${senderId}.jpg`;
                        const imagePath = path.join(uploadDir, imageName);
                        console.log('Saving image to:', imagePath); // Log the image save path
                        try {
                            fs.writeFileSync(imagePath, buffer); // Write to file system
                        } catch (err) {
                            console.error("Error saving image:", err);
                            return socket.emit("error", { message: "Failed to save image" });
                        }
                        // Write to file system
                        imageUrl = `uploads/${imageName}`; // Set the accessible image path
                    } else {
                        console.error("Invalid image format");
                        return socket.emit("error", { message: "Invalid image format" });
                    }
                }

                // Find or create chat room
                let chatRoom = await ChatRoom.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId },
                        { sender: receiverId, receiver: senderId }
                    ]
                });
                console.log("exist", chatRoom);

                if (!chatRoom) {
                    chatRoom = new ChatRoom({
                        sender: senderId,
                        receiver: receiverId,
                        messages: [],
                    });
                    await chatRoom.save();
                    console.log(`New chat room created between ${senderId} and ${receiverId}`);
                }

                // Add the new message
                //populate the sender and receiver
                const sender = await User.findById(senderId);
                const newMessage = {
                    user: sender,
                    message,
                    image: imageUrl,
                    createdAt: new Date(),
                };

                chatRoom.messages.push(newMessage);

                // Update the last message
                chatRoom.lastMessage = {
                    user: senderId,
                    message,
                    image: imageUrl,
                    createdAt: new Date(),
                };





                await chatRoom.save();
                console.log('Chat room updated successfully with new message');

                // Emit message to receiver
                io.to(receiverId).emit("received_message", newMessage);
                //emit message to sender
                io.to(senderId).emit("received_message", newMessage);

                const updatedChatRoom = await ChatRoom.findById(chatRoom._id)
                    .populate("sender receiver")
                    .populate("lastMessage.user");

                io.to(receiverId).emit("newMessage", `New message from ${updatedChatRoom.sender.firstName}: ${message}`);


                io.to(senderId).emit("chat_room_updated", updatedChatRoom);
                io.to(receiverId).emit("chat_room_updated", updatedChatRoom);

            } catch (err) {
                console.error("Error sending message:", err);
            }


            //send notification to receiver
            try {
                // 1. Save the notification to the database
                const newNotification = new Notification({
                  title: "Message Notification",
                  sender: senderId,
                  receiver: receiverId,
                  type: "others",
                  message: "You have a new message",
                });
            
                await newNotification.save();
                console.log("Notification saved to DB:", newNotification);
            
                // 2. Emit the notification to the receiver in real-time
                const populatedNotification = await Notification.findById(newNotification._id)
                  .populate("sender receiver");
            
                io.to(receiverId.toString()).emit("receive_notification", populatedNotification);
            
              } catch (err) {
                console.error("Error sending notification:", err);
                socket.emit("error", { message: "Failed to send notification" });
              }
        });
        // Get all chat rooms for a user
      
        // socket.on("send_message", async ({ senderId, receiverId, message, image }) => {
        //     try {
        //         console.log("senderId", senderId, "receiverId", receiverId, "message", message);
        //         console.log("image", image);
        
        //         // Handle image upload
        //         let imageUrl = null;
        //         if (image) {
        //             // Validate if the image is a valid base64 string
        //             if (typeof image === 'string' && image.startsWith('data:image/')) {
        //                 const base64Data = image.split(',')[1]; // Extract base64 content
        //                 const buffer = Buffer.from(base64Data, 'base64'); // Convert to Buffer
        
        //                 // Save the image
        //                 const imageName = `${Date.now()}-${senderId}.jpg`;
        //                 const imagePath = path.join(uploadDir, imageName);
        //                 console.log('Saving image to:', imagePath); // Log the image save path
        //                 try {
        //                     fs.writeFileSync(imagePath, buffer); // Write to file system
        //                 } catch (err) {
        //                     console.error("Error saving image:", err);
        //                     return socket.emit("error", { message: "Failed to save image" });
        //                 }
        //                 // Write to file system
        //                 imageUrl = `uploads/${imageName}`; // Set the accessible image path
        //             } else {
        //                 console.error("Invalid image format");
        //                 return socket.emit("error", { message: "Invalid image format" });
        //             }
        //         }
        
        //         // Find or create chat room
        //         let chatRoom = await ChatRoom.findOne({
        //             $or: [
        //                 { sender: senderId, receiver: receiverId },
        //                 { sender: receiverId, receiver: senderId }
        //             ]
        //         });
        //         console.log("exist", chatRoom);
        
        //         if (!chatRoom) {
        //             chatRoom = new ChatRoom({
        //                 sender: senderId,
        //                 receiver: receiverId,
        //                 messages: [],
        //             });
        //             await chatRoom.save();
        //             console.log(`New chat room created between ${senderId} and ${receiverId}`);
        //         }
        
        //         // Add the new message
        //         //populate the sender and receiver
        //         const sender = await User.findById(senderId);
        //         const newMessage = {
        //             user: sender,
        //             message,
        //             image: imageUrl,
        //             createdAt: new Date(),
        //         };
        
        //         chatRoom.messages.push(newMessage);
        
        //         // Update the last message
        //         chatRoom.lastMessage = {
        //             user: senderId,
        //             message,
        //             image: imageUrl,
        //             createdAt: new Date(),
        //         };
        
        //         await chatRoom.save();
        //         console.log('Chat room updated successfully with new message');
        
        //         // MODIFIED: Only emit received_message to the receiver
        //         io.to(receiverId).emit("received_message", newMessage);
                
        //         // Keep emitting to sender for their own UI updates (but not as received_message)
        //         const senderMessageCopy = {...newMessage, isOwnMessage: true};
        //         io.to(senderId).emit("new_message", senderMessageCopy);
        
        //         const updatedChatRoom = await ChatRoom.findById(chatRoom._id)
        //             .populate("sender receiver")
        //             .populate("lastMessage.user");
        
        //         io.to(receiverId).emit("newMessage", `New message from ${updatedChatRoom.sender.firstName}: ${message}`);
        
        //         // Keep chat room updates for both users
        //         io.to(senderId).emit("chat_room_updated", updatedChatRoom);
        //         io.to(receiverId).emit("chat_room_updated", updatedChatRoom);
        
        //     } catch (err) {
        //         console.error("Error sending message:", err);
        //     }
        
        //     //send notification to receiver
        //     try {
        //         // 1. Save the notification to the database
        //         const newNotification = new Notification({
        //             title: "Message Notification",
        //             sender: senderId,
        //             receiver: receiverId,
        //             type: "others",
        //             message: "You have a new message",
        //         });
            
        //         await newNotification.save();
        //         console.log("Notification saved to DB:", newNotification);
            
        //         // 2. Emit the notification to the receiver in real-time
        //         const populatedNotification = await Notification.findById(newNotification._id)
        //             .populate("sender receiver");
            
        //         io.to(receiverId.toString()).emit("receive_notification", populatedNotification);
            
        //     } catch (err) {
        //         console.error("Error sending notification:", err);
        //         socket.emit("error", { message: "Failed to send notification" });
        //     }
        // });
        socket.on("get_chat_rooms", async (userId) => {

            try {
                const chatRooms = await ChatRoom.find({
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                })
                    .populate("sender receiver")
                    .populate("lastMessage.user");

                socket.emit("chat_rooms", chatRooms);
            } catch (err) {
                console.error("Error getting chat rooms:", err);
            }
        });

        // chant_rooms , user will pass receiverId send requester the details of the chat room

        // find chat room by senderId and receiverId if does not exist create a new chat room
        socket.on("create_chat_room", async ({ senderId, receiverId }) => {
            try {
                let chatRoom = await ChatRoom.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId },
                        { sender: receiverId, receiver: senderId }
                    ]
                });

                if (!chatRoom) {
                    chatRoom = new ChatRoom({
                        sender: senderId,
                        receiver: receiverId,
                        messages: [],
                    });
                    await chatRoom.save();
                    console.log(`New chat room created between ${senderId} and ${receiverId}`);


                }

                const updatedChatRoom = await ChatRoom.findById(chatRoom._id)
                    .populate("sender receiver")
                    .populate("lastMessage.user");

                io.to(senderId).emit("chat_room_updated", updatedChatRoom);
                io.to(receiverId).emit("chat_room_updated", updatedChatRoom);

            } catch (err) {
                console.error("Error finding chat room:", err);
            }

            try {
                const chatRooms = await ChatRoom.find({
                    $or: [
                        { sender: senderId },
                        { receiver: senderId }
                    ]
                })
                    .populate("sender receiver")
                    .populate("lastMessage.user");

                socket.emit("chat_rooms", chatRooms);
            } catch (err) {
                console.error("Error getting chat rooms:", err);
            }
        }
        );

        // Get chat room messages
        socket.on("get_chat_room_messages", async (roomId) => {
            try {
                const chatRoom = await ChatRoom.findById(roomId).populate("sender receiver").populate("messages.user");
                if (!chatRoom) {
                    return socket.emit("error", { message: "Chat room not found" });
                }
                socket.emit("chat_room_messages", chatRoom.messages);

            } catch (err) {
                console.error("Error getting chat room messages:", err);
            }
        });




        // Handle disconnection
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

// Emit custom events
const sendNotification = (socketId, event, data) => {
    if (io) {
        io.to(socketId).emit(event, data);
    }
};

const emitData = (socketId, event, data) => {
    if (io) {
        io.to(socketId).emit(event, data);
    }
};

module.exports = { initSocket, sendNotification, emitData };



