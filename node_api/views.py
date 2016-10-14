from django.shortcuts import render, redirect
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth.models import User
from example.models import Chater, Messages
from django.http import HttpResponse, JsonResponse
import json
from django.contrib.auth.decorators import login_required

APIKEY = "a"
# home view redirect
def home(request):
	return redirect('/')

#user post his socket id
@login_required(login_url='../login/')
def post(request):
	# if method = post
	if request.method == 'POST':
		# get socket id
		socket_id = request.POST.get('id')
		# get Chater object
		query = Chater.objects.filter(user_id=request.user.id)
		if query == []:
			query = Chater(user_id=request.user.id)
		# set the socket and save
		query[0].setSocket(socket_id)
		return json_response({})
	else :
		return redirect('/')

# node get users
def getUsers(request):

	# get session
    sessions = Session.objects.filter(expire_date__gte=timezone.now())
    uid_list = []

    # Build a list of user ids from that query
    for session in sessions:
        data = session.get_decoded()
        uid_list.append(data.get('_auth_user_id', None))

    # Query all logged in users based on id list
    data = User.objects.filter(id__in=uid_list)
    jsonresult = {}

    # parse data for API
    for d in data:
    	jsonresult[d.id] = {}
    	jsonresult[d.id]["username"] = d.username
    	jsonresult[d.id]["socket"] = Chater.objects.filter(user_id=d.id)[0].socket_io

    return json_response(jsonresult)


#date handler
def date_handler(obj):
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        raise TypeError


#node get messages
def getMessages(request):
	# get messages ordered by date limit 20
    messages = Messages.objects.all().order_by('-date')[:20]

    jsonresult = {}

    # parse data for API
    for d in messages:
    	jsonresult[d.id] = {}
    	jsonresult[d.id]["user"] = {}
    	jsonresult[d.id]["user"]["user_id"] = d.user_id
    	jsonresult[d.id]["user"]["username"] = User.objects.get(id=d.user_id).username
    	jsonresult[d.id]["content"] = d.message
    	jsonresult[d.id]["date"] = json.dumps(d.date, default=date_handler)

    return json_response(jsonresult)

def json_response(something):
	# write data into JSON format
    return HttpResponse(
        json.dumps(something),
        content_type = 'application/javascript; charset=utf8'
    )