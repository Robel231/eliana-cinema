from django.contrib import admin
from .models import Movie, Theater, Showtime, Booking, Payment
from django.utils.html import format_html

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

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'uploaded_at', 'is_approved', 'payment_proof_image')
    readonly_fields = ('payment_proof_image',)
    actions = ['approve_payment']

    def payment_proof_image(self, obj):
        return format_html('<a href="{0}" target="_blank"><img src="{0}" width="100" /></a>', obj.payment_proof.url)

    payment_proof_image.short_description = 'Payment Proof'

    def approve_payment(self, request, queryset):
        queryset.update(is_approved=True)
        for payment in queryset:
            payment.booking.payment_status = 'COMPLETED'
            payment.booking.save()

    approve_payment.short_description = "Approve selected payments"
""