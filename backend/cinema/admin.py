from django.contrib import admin
from .models import Movie, Theater, Showtime, Booking

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'genre', 'duration', 'release_date')
    search_fields = ('title', 'genre')
    list_filter = ('genre', 'release_date')

@admin.register(Theater)
class TheaterAdmin(admin.ModelAdmin):
    list_display = ('name', 'capacity')
    search_fields = ('name',)

@admin.register(Showtime)
class ShowtimeAdmin(admin.ModelAdmin):
    list_display = ('movie', 'theater', 'date_time')
    search_fields = ('movie__title', 'theater__name')
    list_filter = ('date_time', 'theater')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('showtime', 'user', 'num_tickets', 'seats', 'booking_time')
    search_fields = ('showtime__movie__title', 'user__username')
    list_filter = ('booking_time', 'showtime')