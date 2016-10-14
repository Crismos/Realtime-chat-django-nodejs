from django.conf.urls import url, include
from django.views.generic.edit import CreateView
from django.contrib.auth.forms import UserCreationForm
from . import views


urlpatterns = [
    url(r'^$', views.home),
    url('^login', views.LoginView.as_view()),
    url('^logout', views.logout),
	url('^register/', CreateView.as_view(
            template_name='register.html',
            form_class=UserCreationForm,
            success_url='/'
    )),
    url('^post_message/', views.post_message),
]