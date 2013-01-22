var passport = require('passport'),
    User = require('./models/user');


function redirectNotLoggedIn(res, req) {
    if (req.user === undefined)
    {
        res.redirect('/login');
        return true;
    }
    
    return false;
}

function redirectLoggedIn(res, req) {
    if (req.user !== undefined)
    {
        res.redirect('/');
        return true;
    }
    
    return false;
}

module.exports = function(app) {

    app.get('/', function(req, res) {
        if (redirectNotLoggedIn(res, req)) return;
        
        res.render('index', { user: req.user });
	});
	
	app.get('/login', function(req, res) {
	    if (redirectLoggedIn(res, req)) return;
	
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
	   if (redirectLoggedIn(res, req)) return;
	
	   res.render('register');
	});
	
	app.post('/register', function(req, res) {
	   if (redirectLoggedIn(res, req)) return;
	
	   User.register(new User({ username: req.body.username }), req.body.password, function(err, user) {
	       if (err) {
	           res.redirect('/register');
	       }
	       
	       res.redirect('/login');
	   });
	});
}