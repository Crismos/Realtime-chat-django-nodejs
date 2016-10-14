from django.conf.urls import url, include
from . import views


urlpatterns = [
    url(r'^$', views.home),
    url(r'^get_users', views.getUsers),
    url(r'^get_messages', views.getMessages),
    url(r'^post', views.post),
]