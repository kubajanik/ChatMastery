const io = require('./index').io();
const Message = require('../models/Message');
const User = require('../models/User');

io.on('connection', socket => {
    const changeUserStatus = async status => {
        const session = socket.handshake.session;
        if (session.passport && session.passport.user) {
            await User.updateOne({ _id: session.passport.user._id }, { active: status }).exec();

            io.emit('userStatusChanged', { userId: session.passport.user._id, status: status });
        }
    };

    changeUserStatus(true);
    
    socket.on('disconnect', () => changeUserStatus(false));
    socket.on('userLogout', () => changeUserStatus(false));

    socket.on('readMessages', ({ conversationId, userId }) => {
        Message.updateMany({
            $and: [
                    { conversationId: conversationId },
                    { author: { $ne: userId } }
                ]
            },
            { read: true }
        ).exec();
    });
});