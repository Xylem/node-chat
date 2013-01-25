var User = require('./models/user'),
    sanitizer = require('sanitizer'),
    access = require('./access')
    
exports.registerUser = function(req, res) {
    if (access.redirectLoggedIn(res, req)) return;

    var newUser = new User({ username: sanitizer.escape(req.body.username) });

    User.register(newUser, sanitizer.escape(req.body.password), function(err, user) {
        if (err) {
            res.redirect('/register');
            
            return;
        }
        
        global.io.sockets.emit('newUser', { user: newUser.id });
        
        res.redirect('/login');
    });
}
    
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

exports.getSelf = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    User.getUser(req.user.id, function(err, user) {
        res.json(user);
    });
}

exports.getOnline = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;
    
    res.json({ online: Object.keys(global.connectedUsers) });
}
