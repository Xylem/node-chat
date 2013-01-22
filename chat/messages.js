var Message = require('./models/message'),
    User = require('./models/user'),
    access = require('./access')
    
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
            var message = Message.sendMessage(req.user.id, req.body.to, req.body.message);
            
            if (global.connectedUsers[req.body.to] !== undefined) {
                var socket = global.connectedUsers[req.body.to];
                socket.emit('newMessage', { from: message.from, id: message.id });
            }
            
            res.json(message);
        }
    });
}