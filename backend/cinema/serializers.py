from rest_framework import serializers
from .models import Movie, Theater, Showtime, Booking, Payment
from django.contrib.auth.models import User
from django.db import models

class MovieSerializer(serializers.ModelSerializer):
       class Meta:
           model = Movie
           fields = '__all__'

class TheaterSerializer(serializers.ModelSerializer):
       class Meta:
           model = Theater
           fields = '__all__'

class ShowtimeSerializer(serializers.ModelSerializer):
       movie = MovieSerializer(read_only=True)
       theater = TheaterSerializer(read_only=True)

       class Meta:
           model = Showtime
           fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
       showtime = ShowtimeSerializer(read_only=True)
       showtime_id = serializers.PrimaryKeyRelatedField(
           queryset=Showtime.objects.all(), source='showtime', write_only=True
       )
       payment = PaymentSerializer(read_only=True)

       class Meta:
           model = Booking
           fields = ['id', 'showtime', 'showtime_id', 'num_tickets', 'booking_time', 'seats', 'payment_status', 'transaction_id', 'payment']

       def validate(self, data):
           showtime = data.get('showtime')
           num_tickets = data.get('num_tickets')
           seats = data.get('seats', '').split(',') if data.get('seats') else []

           try:
               if len(seats) != num_tickets:
                   raise serializers.ValidationError(
                       f"Number of seats ({len(seats)}) must match number of tickets ({num_tickets})."
                   )
               total_booked = Booking.objects.filter(showtime=showtime).aggregate(
                   total=models.Sum('num_tickets')
               )['total'] or 0
               available_seats = showtime.theater.capacity - total_booked
               if num_tickets > available_seats:
                   raise serializers.ValidationError(
                       f"Only {available_seats} seats are available for this showtime."
                   )
               booked_seats = Booking.objects.filter(showtime=showtime).values_list('seats', flat=True)
               booked_seats = [seat for booking_seats in booked_seats for seat in booking_seats.split(',') if booking_seats]
               for seat in seats:
                   if seat in booked_seats:
                       raise serializers.ValidationError(f"Seat {seat} is already booked.")
           except Exception as e:
               raise serializers.ValidationError(f"Validation failed: {str(e)}")

           return data

class UserSerializer(serializers.ModelSerializer):
       bookings = BookingSerializer(many=True, read_only=True, source='booking_set')
       phone = serializers.CharField(max_length=15, required=False, allow_blank=True)

       class Meta:
           model = User
           fields = ['id', 'username', 'email', 'phone', 'password', 'bookings']
           extra_kwargs = {
               'password': {'write_only': True},
           }

       def create(self, validated_data):
           user = User.objects.create_user(
               username=validated_data['username'],
               email=validated_data.get('email', ''),
               password=validated_data['password']
           )
           user.profile.phone = validated_data.get('phone', '')
           user.profile.save()
           return user

       def update(self, instance, validated_data):
           instance.email = validated_data.get('email', instance.email)
           instance.profile.phone = validated_data.get('phone', instance.profile.phone)
           instance.save()
           instance.profile.save()
           return instance

       def validate_email(self, value):
           if User.objects.exclude(pk=self.instance.pk if self.instance else None).filter(email=value).exists():
               raise serializers.ValidationError("This email is already in use.")
           return value