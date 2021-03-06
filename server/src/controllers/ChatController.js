import User from '../models/User';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { Types } from 'mongoose';
import socket from '../socket';
import { check } from 'express-validator';
import { isValidate, getValidationErrors } from '../helpers/validation';
const PART_SIZE = 10;

export default {
    async getConversations(req, res) {
        const conversations = await Conversation
            .find({ members: req.params.userId })
            .populate({ 
                path: 'members', 
                select: 'name avatar active', 
                match: { _id: { $ne: req.params.userId }}
            });

        if (! conversations.length) {
            return res.json([]);
        }
        
        const fullConversations = [];
        conversations.forEach(async conversation => {
            const message = await Message
                .find({ conversationId: conversation._id })
                .sort('-createdAt')
                .limit(1)
                .select('body createdAt');

            const result = await Message.aggregate([
                {
                    $match: { 
                        $and: [
                            { read: false },
                            { author: { $ne: req.params.userId } },
                            { conversationId: conversation._id }
                        ]
                    }
                }, {
                    $count: 'unreadMessages'
                }
            ]);
            
            const unreadMessages = result.length ? result[0].unreadMessages : 0;

            fullConversations.push({
                ...conversation._doc, 
                unreadMessages,
                lastMessage: message[0] 
            });

            if (conversations.length == fullConversations.length) {
                fullConversations.sort((x, y) => 
                    new Date(y.lastMessage.createdAt) - new Date(x.lastMessage.createdAt)
                );
                
                return res.json(fullConversations);
            }
        })
    },

    async getMessages(req, res, next) {
        const messages = await Message
            .find({ conversationId: Types.ObjectId(req.params.id) })
            .populate('author','name avatar')
            .sort('-createdAt')
            .skip(req.params.part * PART_SIZE)
            .limit(PART_SIZE)
            .select('-conversationId')
            
        return res.json(messages.reverse());
    },

    async storeMessage(req, res) {
        const message = await new Message(req.body).save();

        const messages = await Message
            .find({ _id: message._id })
            .populate('author','name avatar')
        
        socket.io().emit('messageAdded', messages[0]);
                    
        return res.json({ message: 'Message added successfully'});
    },

    async storeConversation(req, res) {
        const conversation = new Conversation(req.body);

        const response = await conversation.save();
        return res.send(response._id);
    },

    validateGroup: [
        check('group.name')
            .not().isEmpty().withMessage('Group name is required'),

        check('members')
            .custom(value => value.length < 3 ? Promise.reject('You must choose minimum 3 users') : '')
    ],

    async storeGroup(req, res) {
        if (! isValidate(req)) {
            return res.json(getValidationErrors(req));
        }

        const group = new Conversation(req.body);

        const response = await group.save();
        return res.send(response._id);
    },

    async deleteConversation({ params: { id } }, res) {
        await Conversation.deleteOne({ _id: id });

        await Message.deleteMany({ conversationId: id });

        socket.io().emit('conversationDeleted', id);
    }
}