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
	  	socket.auth = false;

	  	// when client update API
	  	socket.on("API UPDATE: new user", function() {
			api.users(function(data) {
				// get online users with the API
				var users = [];
				for(var key in data) {
					// foreach check if the users exist
					if(data[key].socket === socket.id) {
						// if user exist then log him to nodejs with django API
						console.log("API UPDATE: new user" + date() + "User "+data[key].username+" is auth with id: "+key+"("+data[key].socket+")");
						socket.auth = data[key];
						socket.auth.id = key;
						// emit to other clients that there is a new client
						socket.broadcast.emit("NEW USER", {username: data[key].username});
					} else if(data[key].socket !== '-1') {
						// push to users all other connected clients
						users.push({username: data[key].username});
					}
				}
				// update client user-connected list
				socket.emit("SET USER LIST", users);
			});
	  	});
	});

	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});
});


/*

*/