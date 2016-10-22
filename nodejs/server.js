var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var api = require('./chat_api.js')();



api.connect(function() {
	console.log('Connected to the API');
	
	var dateFormat = require('dateformat');

	// define the current date for console.log
	function date() {
		var now = new Date();
		return " ["+dateFormat(now, "HH:MM:ss")+"] ";
	}

	// client connection
	io.on('connection', function(socket){
	  	console.log(date() + socket.id + ' a user connected');
	  	// initialyzing socket
	  	// emit the socket id to the client
	  	socket.emit('USERID', {id : socket.id});
	  	socket.auth = api.getDjangoSession(socket);
	  	socket.user = {};

	  	if(socket.auth) {
	  		api.postSocket(socket, function() {
	  			api.users(function(data) {
	  				var users = [];
	  				for(var key in data) {
	  					if(data[key].socket === socket.id) {

	  						socket.user.username = data[key].username;
	  						socket.user.session = data[key].session;
	  						socket.user.socket = socket.id;

	  						console.log(date() + "User "+data[key].username+" is auth with id: "+key+"("+data[key].socket+") ["+socket.auth+"]");
	  						socket.broadcast.emit("NEW USER", {username: data[key].username});
	  					} else {
	  						users.push({username: data[key].username});
	  					}
	  				}
	  				socket.emit('SET USER LIST', users);
	  			});
	  		});

	  		socket.on('NEW MESSAGE', function(data) {
	  			var d = {
	  				user: {
	  					username: socket.user.username
	  				},
	  				content: data.message
	  			};

	  			socket.broadcast.emit('message', d);
	  		});

	  		socket.on('disconnect', function() {
	  			socket.broadcast.emit('User leave', {username: socket.user.username});
	  		});
	  	} else {
	  		// user not connected
	  		console.log('User not logged');
	  	}
	});

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
});


/*

*/