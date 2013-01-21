var express = require('express'),
	app = express(),
	compiless = require('express-compiless'),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	staticRoot = __dirname + "/public";
	
server.listen(81);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(compiless(
		{
			root: staticRoot
		}));
app.use(express.static(staticRoot));


app.get('/', function(req, res) {
	res.render('index');
});

console.log('Listening on port 80');