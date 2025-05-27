from django.urls import path
from .views import (
       MovieList, MovieDetail, ShowtimeList, BookingListCreate,
       RegisterView, UserProfileView, ShowtimeBookedSeats,
       TelebirrPaymentView, TelebirrNotificationView
   )

urlpatterns = [
       path('movies/', MovieList.as_view(), name='movie-list'),
       path('movies/<int:pk>/', MovieDetail.as_view(), name='movie-detail'),
       path('showtimes/', ShowtimeList.as_view(), name='showtime-list'),
       path('bookings/', BookingListCreate.as_view(), name='booking-list-create'),
       path('register/', RegisterView.as_view(), name='register'),
       path('users/me/', UserProfileView.as_view(), name='user-profile'),
       path('showtimes/<int:showtime_id>/booked-seats/', ShowtimeBookedSeats.as_view(), name='showtime-booked-seats'),
       path('payments/<int:booking_id>/', TelebirrPaymentView.as_view(), name='telebirr-payment'),
       path('payments/notify/', TelebirrNotificationView.as_view(), name='telebirr-notify'),
   ]