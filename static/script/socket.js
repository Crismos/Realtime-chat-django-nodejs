/*
* Send message
*
*/

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
	// setup ajax to automaticaly send CSRF token
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

/*
* Class Users
*		description: Change the users display easily
*
*  		methods: 
*			+ addUser:user -> add user to user list
*			- updateView:void -> update user view for the client
*/
function Users() {
	var users = [];
	const userText = '<div class="user"><img src="/media/images/users/default.png"/><span>{=username=}</span><span class="status">Online</span></div>';

	this.__defineGetter__('users', function() {
		return users;
	});
	this.__defineSetter__('users', function(data) {
		// if users list wasn't set or is empty
		if(users.length === 0) {
			users = data;
			updateView();
		}
		
	});

	this.addUser = function(user) {
		// push new user into the list
		users.push(user);
		updateView();
	} 

	this.remove = function(user) {
		var index = 0;
		for(var key in users) {
			if(users[key].username === user.username) {
				break;
			}
			index++;
		}
		if(index < users.length) {
			users.splice(index, 1);
		}
		updateView();
	}

	function updateView() {
		// sort user array order by name
		var u = users.sort(function(a,b) {
			if(a.username < b.username)
				return 1;
			return -1;
		});

		// update view with const userText
		$("#users").html("");
		for(var key in u) {
			$("#users").append(userText.replace("{=username=}", u[key].username));
		}
	}
}

$(document).ready(function() {

	// initialyzing user view
	var users = new Users();

	// connecting to socket.io 
	var socket = io("ws://localhost:3000");

	// get the user list from nodejs 
	socket.on("SET USER LIST", function(data) {
		users.users = data;
	});

	// when there is a new user
	socket.on("NEW USER", function(data) {
		users.addUser(data);
	});

	socket.on('User leave', function(data) {
		users.remove(data);
	});

	const message = '<div class="message{=other=}"><div class="header"><span><small>{=pseudo=}</small></span></div><div class="content"><p>{=content=}</p></div></div>';

	socket.on('message', function(data) {
		$("#messages").append(message.replace('{=other=}',' other').replace('{=pseudo=}', data.user.username).replace('{=content=}', data.content));
		scroll();
	});


	// add message to the list

	$("#submit").click(function() {
		$("#messages").append(message.replace('{=other=}','').replace('{=pseudo=}', pseudo).replace('{=content=}', $("#text").val().replace(/\n/g,"<br>")));
		scroll();
		var d = {message: $("#text").val()};
		$.post("post_message/",	d).done(function(data) {
			socket.emit("NEW MESSAGE", d);
			$("#text").val("");
		});
	});
	scroll();
});
