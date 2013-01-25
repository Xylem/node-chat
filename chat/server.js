var express                = require('express'),
	app                    = express(),
	compiless              = require('express-compiless'),
	server                 = require('http').createServer(app),
	passport               = require('passport'),
	passportLocal          = require('passport-local'),
	LocalStrategy          = passportLocal.Strategy,
	mongoose               = require('mongoose'),
	Schema                 = mongoose.Schema,
	passportLocalMongoose  = require('passport-local-mongoose'),
	User                   = require('./models/user'),
	passportSocketIo       = require("passport.socketio"),
	MongoStore             = require('connect-mongo')(express),
	handlebarsPrecompiler  = require('handlebars-precompiler'),
	staticRoot             = __dirname + "/public";
	
// globals

global.io = require('socket.io').listen(server);
global.connectedUsers  = {};

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

var sessionStore = new MongoStore({
    db: 'test'
});

app.use(express.session({
    secret: 'totally unguessable secret',
    store: sessionStore
}));

app.use(passport.initialize());
app.use(passport.session());

// socket

global.io.set("authorization", passportSocketIo.authorize({
    sessionKey:    'connect.sid',      
    sessionStore:  sessionStore, 
    sessionSecret: 'totally unguessable secret',
    success: function(data, accept) {
      accept(null, true);
    }
  }));

global.io.sockets.on("connection", function(socket){
    global.connectedUsers[socket.handshake.user.id] = socket;
    
    var sentDate = new Date().getTime();
    
    socket.broadcast.emit('statusChange', { user: socket.handshake.user.id, online: true, sent: sentDate });
    
    socket.on('disconnect', function() {
        if (global.connectedUsers[socket.handshake.user.id] !== undefined && socket.id == global.connectedUsers[socket.handshake.user.id].id) {
	        var sentDate = new Date().getTime();
	    
	        socket.broadcast.emit('statusChange', { user: socket.handshake.user.id, online: false, sent: sentDate });
	    
	        delete global.connectedUsers[socket.handshake.user.id];
        }
    });
});

// client-side templates

handlebarsPrecompiler.watchDir(
    __dirname + '/templates',
    staticRoot + '/res/js/templates.js',
    ['handlebars', 'hbs']
);

//routes
var routes = require('./includes/routes');
routes(app);

// db connection
mongoose.connect('mongodb://localhost/test');   

    
// start server
    
server.listen(81);
console.log('Listening on port 81');