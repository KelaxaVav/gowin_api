const { Server } = require('socket.io');
const { User, Chat, Message, Event } = require('./models');
const { instrument } = require('@socket.io/admin-ui');
const { verifyJWT } = require('./utils/jwtAuth');

module.exports = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        console.log('headers', socket.request.headers);

        try {
            const payload = verifyJWT(socket.request, next);
            const user = await User.findOne({
                where: {
                    user_id: payload.user_id,
                    is_verified: true,
                },
                include: [
                    {
                        model: Chat,
                        as: 'chats',
                        include: [
                            {
                                model: Event,
                                as: 'event',
                            },
                        ],
                    },
                ],
            });
            if (!user) {
                return next(new Error("Socket.IO authentication failed"));
            }
            socket.auth = user.toJSON();
            socket.data['username'] = user.username;
            console.log(`username`, user.username);
            next();
        } catch (error) {
            console.log(error);
            next(new Error(error.name));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`event : connection from`, socket.auth.username);
        joinToRooms(socket);

        socket.on("disconnecting", (reason) => {
            console.log(`${socket.auth.username} disconnected`);
        });

        socket.on('typing', async (chat_id) => {
            socket.to(chat_id).emit('typing', socket.auth.user_id);
        });

        socket.on('send_message', async (toChat, data,) => {
            try {
                const { user_id } = socket.auth;
                const newMessage = await Message.create({
                    user_id,
                    chat_id: toChat,
                    type: data.type,
                    text: data.text,
                    to_user_id: data.to_user_id,
                });

                io.to(toChat).emit('message', newMessage);
            } catch (error) {
                console.log(error);
                socket.emit("send_message_error", "Send message failed");
            }
        });
    });

    // dev only
    instrument(io, {
        auth: false,
        // readonly: true,
        mode: "development",
    });
    return io;
}

const joinToRooms = async (socket) => {
    socket.auth.chats.forEach(chat => {
        socket.join(chat.chat_id);
    });
}
