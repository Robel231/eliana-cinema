from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
       user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
       phone = models.CharField(max_length=15, blank=True)

       def __str__(self):
           return f"{self.user.username}'s profile"

class Movie(models.Model):
       title = models.CharField(max_length=100)
       genre = models.CharField(max_length=50)
       duration = models.IntegerField()
       poster = models.URLField(max_length=500)
       release_date = models.DateField()
       director = models.CharField(max_length=100, blank=True)

       def __str__(self):
           return self.title

class Theater(models.Model):
       name = models.CharField(max_length=100)
       capacity = models.IntegerField()
       rows = models.IntegerField(default=10)
       columns = models.IntegerField(default=15)

       def __str__(self):
           return self.name

class Showtime(models.Model):
       movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
       theater = models.ForeignKey(Theater, on_delete=models.CASCADE)
       date_time = models.DateTimeField()

       def __str__(self):
           return f"{self.movie.title} at {self.theater.name} on {self.date_time}"

class Booking(models.Model):
       user = models.ForeignKey(User, on_delete=models.CASCADE)
       showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE)
       num_tickets = models.IntegerField()
       booking_time = models.DateTimeField(auto_now_add=True)
       seats = models.CharField(max_length=100)
       payment_status = models.CharField(
           max_length=20,
           choices=[
               ('PENDING', 'Pending'),
               ('PENDING_APPROVAL', 'Pending Approval'),
               ('COMPLETED', 'Completed'),
               ('FAILED', 'Failed'),
               ('REJECTED', 'Rejected'),
           ],
           default='PENDING'
       )
       transaction_id = models.CharField(max_length=100, blank=True)

       def __str__(self):
           return f"Booking for {self.showtime} by {self.user.username}"

class Payment(models.Model):
       booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
       payment_proof = models.ImageField(upload_to='payment_proofs/')
       uploaded_at = models.DateTimeField(auto_now_add=True)
       is_approved = models.BooleanField(default=False)

       def __str__(self):
           return f"Payment for booking {self.booking.id}"