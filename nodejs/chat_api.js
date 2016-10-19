var request = require("request");
var querystring = require('querystring');
const APIKEY = require('./api_key.json');
var http = require('http');

var SESSION_ID = null;

function getCSRF(callback) {
	callback = callback || function() {};
	request("http://localhost:8000/login/", function(error, response, body) {
		callback(response, {'csrfmiddlewaretoken':response.headers['set-cookie'][0].split(';')[0].replace('csrftoken=','')});
	});
}

function getCookie(base, c_name)
{
	for(var key in base) {
		var split = base[key].split(';')[0].split('=')
		if(split[0] === c_name) {
			return split[1];
		}
	}
}

function getDjangoSession(socket) {
	if(!socket || !socket.handshake || !socket.handshake.headers || !socket.handshake.headers.cookie)
		return false;
	for(var key in socket.handshake.headers.cookie.split(';')) {
  		var cookie = socket.handshake.headers.cookie.split(';')[key].replace(' ','');
  		if(cookie.split('=')[0] === 'sessionid') {
  			return cookie.split('=')[1];
  		}
  	}
}
function getCSRFFromSocket(socket) {
	if(!socket || !socket.handshake || !socket.handshake.headers || !socket.handshake.headers.cookie)
		return false;
	for(var key in socket.handshake.headers.cookie.split(';')) {
  		var cookie = socket.handshake.headers.cookie.split(';')[key].replace(' ','');
  		if(cookie.split('=')[0] === 'csrftoken') {
  			return cookie.split('=')[1];
  		}
  	}
}

function reqGET(url, callback) {
	if(SESSION_ID !== null) {
		var header = {
			'Cookie': 'sessionid=' + SESSION_ID,
			'Connection':'keep-alive',
		}
		request({
			headers: header,
			uri: url,
			method: 'GET',
		}, function(err, res, body) {
			callback(err, res, body)
		});
	} else {
		console.log('Node not logged!');
	}

}

function reqPOST(url , dat, callback) {
	if(SESSION_ID !== null) {
		var data = querystring.stringify(dat);
		contentLength = data.length;
		var header = {
			'Cookie': 'sessionid=' + SESSION_ID,
			'Content-Length': contentLength,
			'Content-Type': 'application/x-www-form-urlencoded',
		}
		request({
			headers: header,
			uri: url,
			body: data,
			method: 'POST'
		}, function (err, res, body) {
	    	callback(err, res, body);
		});
	} else {
		console.log('Node not logged!');
	}
}

function postSocket(socket, callback) {
	callback = callback || function(){};
	reqPOST('http://localhost:8000/node_api/post/',
		{session: socket.auth, socket: socket.id},
		function(err, res, body) {
			callback(err,res,body);
		});
}

function connect(callback) {
	callback = callback || function() {};

	getCSRF(function(response, key) {
		var data = querystring.stringify({ 
			username: APIKEY.username, 
			password: APIKEY.password, 
			csrfmiddlewaretoken: key['csrfmiddlewaretoken']
		});
		contentLength = data.length;
		var header = {
			'Cookie': 'csrftoken=' + key['csrfmiddlewaretoken'],
			'Content-Length': contentLength,
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-CSRFToken': key['csrfmiddlewaretoken'],
		}
		request({
			headers: header,
			uri: 'http://localhost:8000/login/',
			body: data,
			method: 'POST'
		}, function (err, res, body) {
			SESSION_ID = getCookie(res.caseless.dict['set-cookie'], 'sessionid');
			
	    	callback(err, res, body);
		});
	});
}

module.exports = function() {
	return {
		users: function(callback) {
			callback = callback || function() {};
			// getting API with the API Key defined both in nodejs and Django
			reqGET('http://localhost:8000/node_api/get_users', function (error, response, body) {
		    	callback(JSON.parse(body));
			});
		},
		connect: connect,
		getDjangoSession: getDjangoSession,
		postSocket: postSocket,
	}
}