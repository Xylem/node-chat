var Message = require('../models/message'),
    User = require('../models/user'),
    access = require('./access'),
    sanitizer = require('sanitizer');
    
exports.getAllMessages = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    Message.getMessagesBetweenUsers(req.user.id, req.params.otherUser, function(err, messages) {
        res.json(messages);
    });
}

exports.getMessage = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    Message.getMessage(req.user.id, req.params.messageId, function(err, message) {          
        res.json(message);
    });
}

exports.countUnread = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;
    
    Message.countUnread(req.user.id, req.params.otherUser, function(err, count) {
        res.json({ unread: count });
    });    
}

exports.sendMessage = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    User.getUser(req.body.to, function(err, user)
    {
        if (user !== null && user.id !== req.user.id)
        {
            var message = sendMessageDirect(req.user.id, req.body.to, sanitizer.escape(req.body.message));
        }
        
        res.json({ status: 'OK'});
    });
}

function sendMessageDirect(from, to, msg) {
    var message = Message.sendMessage(from, to, msg);
            
    if (global.connectedUsers[message.to] !== undefined) {
        var socket = global.connectedUsers[message.to];
        socket.emit('newMessage', { from: message.from, id: message.id });
    }
    
    if (global.connectedUsers[message.from] !== undefined) {
        var socket = global.connectedUsers[message.from];
        socket.emit('newMessage', { from: message.to, id: message.id });
    }
    
    return message;
}

exports.sendMessageDirect = sendMessageDirect;