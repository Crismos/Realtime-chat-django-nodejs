var request = require("request");
const APIKEY = require('./api_key.json');
module.exports = function() {
	return {
		users: function(callback) {
			callback = callback || function() {};
			// getting API with the API Key defined both in nodejs and Django
			request("http://localhost:8000/node_api/get_users", function(error, response, body) {
			  	callback(JSON.parse(body));
			});
		}
	}
}