var express                = require('express'),
	app                    = express(),
	compiless              = require('express-compiless'),
	server                 = require('http').createServer(app),
	io                     = require('socket.io').listen(server),
	passport               = require('passport'),
	passportLocal          = require('passport-local'),
	LocalStrategy          = passportLocal.Strategy,
	mongoose               = require('mongoose'),
	Schema                 = mongoose.Schema,
	passportLocalMongoose  = require('passport-local-mongoose'),
	staticRoot             = __dirname + "/public";
	
server.listen(81);
	
// db connection

mongoose.connect('mongodb://localhost/test');	
	
var User = require('./models/user');

User.find().remove();

User.register(new User({username: 'Xylem'}), 'test123', function(){});
User.register(new User({username: 'Xylem2'}), 'test', function(){});

// passport strategy


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//settings

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(compiless(
		{
			root: staticRoot
		}));
app.use(express.static(staticRoot));

app.use(express.logger());
app.use(express.bodyParser());

app.use(express.cookieParser('totally unguessable secret'));
app.use(express.session());

app.use(passport.initialize());
app.use(passport.session());

//routes

app.get('/', function(req, res) {
    console.log(req.user);
	res.render('index');
});
app.get('/login', function(req, res) {
    res.render('login');
});
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login' })
);

console.log('Listening on port 81');