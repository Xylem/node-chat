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
	User                   = require('./models/user'),
	staticRoot             = __dirname + "/public";
	
server.listen(81);

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
var routes = require('./routes');
routes(app);

// db connection
mongoose.connect('mongodb://localhost/test');   

console.log('Listening on port 81');