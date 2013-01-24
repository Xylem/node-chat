var passport = require('passport'),
    User = require('./models/user'),
    messages = require('./messages'),
    users = require('./users'),
    access = require('./access');

module.exports = function(app) {

    app.get('/', function(req, res) {
        if (access.redirectNotLoggedIn(res, req)) return;
        
        res.render('index', { user: req.user });
	});
	
	app.get('/login', function(req, res) {
	    if (access.redirectLoggedIn(res, req)) return;
	
	    res.render('login');
	});
	
	app.post('/login',
	   passport.authenticate('local', { successRedirect: '/',
	                                    failureRedirect: '/login' })
	);
	
	app.get('/logout', function(req, res) {
	    req.logout();
	    res.redirect('/login');
	});
	
	app.get('/register', function(req, res) {
	   if (access.redirectLoggedIn(res, req)) return;
	
	   res.render('register');
	});

	app.post('/register', users.registerUser);
	app.get('/users', users.getAllUsers);
    app.get('/self', users.getSelf);
	app.get('/users/:userId', users.getUser);
	app.get('/messages/:messageId', messages.getMessage);
	app.get('/messages/user/:otherUser', messages.getAllMessages);
	app.get('/messages/unread/:otherUser', messages.countUnread);
	app.post('/messages', messages.sendMessage);
}