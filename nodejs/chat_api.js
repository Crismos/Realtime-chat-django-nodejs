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

function req(url, callback) {
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
	}
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
			req('http://localhost:8000/node_api/get_users', function (error, response, body) {
		    	callback(JSON.parse(body));
			});
		},
		connect: connect
	}
}