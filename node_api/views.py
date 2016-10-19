from django.shortcuts import render, redirect
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth.models import User
from example.models import Chater, Messages
from django.http import HttpResponse, JsonResponse
import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

debug = True
# home view redirect
def home(request):
	return redirect('/')

#user post his socket id
@login_required(login_url='../login/')
@csrf_exempt
def post(request):
	# if method = post
	if request.method == 'POST' and (debug == True or request.user.username == 'NodeJS'):
		session_id = request.POST.get('session')
		socket_id = request.POST.get('socket')
		# get user_id from Session
		user_id = Session.objects.filter(session_key=session_id)[0].get_decoded().get('_auth_user_id')
		query = Chater.objects.filter(user_id=user_id)
		if query == []:
			query = Chater(user_id=request.user.id)
		# update API
		query[0].setSocket(socket_id)
		return json_response({})

	else :
		print('Someone try to post')
		return redirect('/')

# node get users
@login_required(login_url='../login/')
def getUsers(request):

	# Only Node can access
	if request.user.username == 'NodeJS' or debug == True:

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
			if(Chater.objects.filter(user_id=d.id)[0].socket_io != '-1'):
				jsonresult[d.id] = {}
				jsonresult[d.id]["sessions"] = []
				for s in Session.objects.all():
					if s.get_decoded().get('_auth_user_id') == str(d.id):
						jsonresult[d.id]["sessions"].append(s.session_key)
				jsonresult[d.id]["username"] = d.username
				jsonresult[d.id]["socket"] = Chater.objects.filter(user_id=d.id)[0].socket_io

		return json_response(jsonresult)
	else:
		return redirect('/')


#date handler
def date_handler(obj):
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        raise TypeError


#node get messages
@login_required(login_url='../login/')
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