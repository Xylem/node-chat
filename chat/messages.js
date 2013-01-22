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

exports.sendMessage = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    User.getUser(req.body.to, function(err, user)
    {
        if (user !== null && user.id !== req.user.id)
        {
            Message.sendMessage(req.user.id, req.body.to, req.body.message);
            
            res.json({ status: 'OK' });
            
            return;
        }
        
        res.json({ status: 'ERROR' });
    });
}