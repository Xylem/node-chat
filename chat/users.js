var User = require('./models/user'),
    access = require('./access')
    
exports.getAllUsers = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    User.getAllUsers(req.user.id, function(err, users) {
        res.json(users);
    });
}

exports.getUser = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    User.getUser(req.params.userId, function(err, user) {
        res.json(user);
    });
}
