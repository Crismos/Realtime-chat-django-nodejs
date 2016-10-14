from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Chater(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	socket_io = models.CharField(max_length=100)

	def setSocket(self, id):
		self.socket_io = id
		self.save()

class Messages(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	message = models.TextField()
	date = models.DateTimeField(auto_now_add=True, auto_now=False, verbose_name="Date")
