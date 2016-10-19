from django.shortcuts import render
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import *
from django.views.generic import TemplateView
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth.models import User
from example.models import Chater, Messages
import json

class LoginView(TemplateView):

	template_name = 'example/login.html'

	def post(self, request, **kwargs):

		username = request.POST.get('username', False)
		password = request.POST.get('password', False)
		user = authenticate(username=username, password=password)
		if user is not None and user.is_active:
			auth_login(request, user)
			return HttpResponseRedirect('/')
			
		return render(request, self.template_name)

@login_required(login_url='login/')
def home(request):
	pseudo = request.user.username
	users = get_all_logged_in_users()
	return render(request, 'example/home.html', locals())

@login_required(login_url='login/')
def logout(request):
	auth_logout(request);
	return HttpResponseRedirect('/')

def get_all_logged_in_users():
    # Query all non-expired sessions
    # use timezone.now() instead of datetime.now() in latest versions of Django
    sessions = Session.objects.filter(expire_date__gte=timezone.now())
    uid_list = []

    # Build a list of user ids from that query
    for session in sessions:
        data = session.get_decoded()
        uid_list.append(data.get('_auth_user_id', None))

    # Query all logged in users based on id list
    return User.objects.filter(id__in=uid_list)

@login_required(login_url='login/')
def post_message(request):
	# if method = post
	if request.method == 'POST':
		# get message content
		message = request.POST.get('message')
		msg = Messages(user_id=request.user.id, message=message)
		msg.save()

		
		return json_response({})
	else :
		return redirect('/')

def json_response(something):
	# write data into JSON format
    return HttpResponse(
        json.dumps(something),
        content_type = 'application/javascript; charset=utf8'
    )