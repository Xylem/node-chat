var Message = require('./models/message'),
    access = require('./access')
    
exports.getAllMessages = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    Message.getMessagesBetweenUsers(req.user.id, req.params.otherUser, function(err, messages) {
        res.json(messages);
    });
}