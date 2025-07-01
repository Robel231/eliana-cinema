from rest_framework import generics, status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Movie, Theater, Showtime, Booking, Payment
from .serializers import MovieSerializer, TheaterSerializer, ShowtimeSerializer, BookingSerializer, UserSerializer, PaymentSerializer
from django.contrib.auth.models import User
from django.db import IntegrityError
import requests
import json
import base64
import uuid
from django.conf import settings
import time
import logging
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

# Set up logging
logger = logging.getLogger(__name__)

@method_decorator(cache_page(60*15), name='dispatch')
class MovieList(generics.ListAPIView):
         queryset = Movie.objects.all()
         serializer_class = MovieSerializer

@method_decorator(cache_page(60*15), name='dispatch')
class MovieDetail(generics.RetrieveAPIView):
         queryset = Movie.objects.all()
         serializer_class = MovieSerializer

class ShowtimeList(generics.ListAPIView):
         queryset = Showtime.objects.all()
         serializer_class = ShowtimeSerializer

class BookingListCreate(generics.ListCreateAPIView):
         queryset = Booking.objects.all()
         serializer_class = BookingSerializer
         permission_classes = [IsAuthenticated]

         def perform_create(self, serializer):
             try:
                 booking = serializer.save(user=self.request.user)
             except Exception as e:
                 logger.error(f"Booking creation error: {str(e)}")
                 return Response(
                     {"detail": f"Error creating booking: {str(e)}"},
                     status=status.HTTP_400_BAD_REQUEST
                 )

class RegisterView(generics.CreateAPIView):
         serializer_class = UserSerializer
         permission_classes = [AllowAny]

         def create(self, request, *args, **kwargs):
             try:
                 serializer = self.get_serializer(data=request.data)
                 serializer.is_valid(raise_exception=True)
                 self.perform_create(serializer)
                 headers = self.get_success_headers(serializer.data)
                 return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
             except IntegrityError as e:
                 logger.error(f"Registration IntegrityError: {str(e)}")
                 return Response(
                     {"detail": "Username or email already exists."},
                     status=status.HTTP_400_BAD_REQUEST
                 )
             except Exception as e:
                 logger.error(f"Registration error: {str(e)}", exc_info=True)
                 return Response(
                     {"detail": f"Registration failed: {str(e)}"},
                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
                 )

class UserProfileView(generics.RetrieveUpdateAPIView):
         serializer_class = UserSerializer
         permission_classes = [IsAuthenticated]

         def get_object(self):
             return self.request.user

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(booking__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        payment = self.get_object()
        payment.is_approved = True
        payment.save()
        payment.booking.payment_status = 'COMPLETED'
        payment.booking.save()
        return Response({'status': 'payment approved'})

class TelebirrPaymentView(APIView):
         permission_classes = [IsAuthenticated]

         def post(self, request, booking_id):
             try:
                 booking = Booking.objects.get(id=booking_id, user=self.request.user)
                 if booking.payment_status != 'PENDING':
                     return Response({'error': 'Payment already processed'}, status=status.HTTP_400_BAD_REQUEST)

                 telebirr_config = {
                     'app_id': settings.TELEBIRR_CONFIG['APP_ID'],
                     'app_key': settings.TELEBIRR_CONFIG['APP_KEY'],
                     'short_code': settings.TELEBIRR_CONFIG['SHORT_CODE'],
                     'api_url': settings.TELEBIRR_CONFIG['API_URL'],
                     'notify_url': 'http://your-domain.com/api/payments/notify/',
                     'return_url': 'http://localhost:5173/payment/confirm',
                     'public_key': settings.TELEBIRR_CONFIG['PUBLIC_KEY'],
                     'timeout': '30',
                     'receiver_name': 'Eliana Cinema',
                 }

                 amount = booking.num_tickets * 100  # Example: 100 ETB per ticket
                 out_trade_no = str(uuid.uuid4().hex)
                 subject = f'Booking {booking.id} for {booking.showtime.movie.title}'
                 data = {
                     'appId': telebirr_config['app_id'],
                     'outTradeNo': out_trade_no,
                     'subject': subject,
                     'totalAmount': str(amount),
                     'shortCode': telebirr_config['short_code'],
                     'notifyUrl': telebirr_config['notify_url'],
                     'returnUrl': telebirr_config['return_url'],
                     'receiveName': telebirr_config['receiver_name'],
                     'timeoutExpress': telebirr_config['timeout'],
                     'nonce': str(uuid.uuid4().hex),
                     'timestamp': str(int(time.time() * 1000)),
                 }

                 signature = base64.b64encode(json.dumps(data).encode()).decode('utf-8')

                 response = requests.post(
                     telebirr_config['api_url'],
                     json={'data': data, 'sign': signature},
                     headers={'Content-Type': 'application/json'},
                 )
                 if response.status_code != 200:
                     logger.error(f"Telebirr API error: {response.text}")
                     return Response({'error': 'Failed to initiate payment'}, status=status.HTTP_400_BAD_REQUEST)
                 response_data = response.json()
                 if response_data.get('code') == '0':
                     booking.transaction_id = out_trade_no
                     booking.save()
                     return Response({'toPayUrl': response_data['data']['toPayUrl']})
                 logger.error(f"Telebirr invalid response: {response_data}")
                 return Response({'error': response_data.get('msg', 'Invalid response')}, status=status.HTTP_400_BAD_REQUEST)
             except Booking.DoesNotExist:
                 logger.error(f"Booking {booking_id} not found")
                 return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
             except Exception as e:
                 logger.error(f"Payment error: {str(e)}", exc_info=True)
                 return Response({'error': f"Payment error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TelebirrNotificationView(APIView):
         permission_classes = [AllowAny]

         def post(self, request):
             try:
                 data = request.data
                 out_trade_no = data.get('outTradeNo')
                 status = data.get('status')
                 booking = Booking.objects.get(transaction_id=out_trade_no)
                 if status == 'SUCCESS':
                     booking.payment_status = 'COMPLETED'
                 else:
                     booking.payment_status = 'FAILED'
                 booking.save()
                 return Response({'status': 'success'}, status=status.HTTP_200_OK)
             except Booking.DoesNotExist:
                 logger.error(f"Booking with transaction_id {out_trade_no} not found")
                 return Response({'error': 'Booking not found'}, status=status.HTTP_400_BAD_REQUEST)
             except Exception as e:
                 logger.error(f"Notification error: {str(e)}", exc_info=True)
                 return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ShowtimeBookedSeats(APIView):
         def get(self, request, showtime_id):
             try:
                 showtime = Showtime.objects.get(id=showtime_id)
                 bookings = Booking.objects.filter(showtime=showtime)
                 booked_seats = []
                 for booking in bookings:
                     if booking.seats:
                         booked_seats.extend(booking.seats.split(','))
                 return Response({'booked_seats': booked_seats})
             except Showtime.DoesNotExist:
                 logger.error(f"Showtime {showtime_id} not found")
                 return Response({'error': 'Showtime not found'}, status=status.HTTP_404_NOT_FOUND)
             except Exception as e:
                 logger.error(f"Error fetching booked seats: {str(e)}", exc_info=True)
                 return Response({'error': f"Error fetching booked seats: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MovieRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        watched_movies = Booking.objects.filter(user=user).values_list('showtime__movie', flat=True)
        watched_genres = Movie.objects.filter(id__in=watched_movies).values_list('genre', flat=True).distinct()
        recommendations = Movie.objects.filter(genre__in=watched_genres).exclude(id__in=watched_movies)[:10]
        serializer = MovieSerializer(recommendations, many=True)
        return Response(serializer.data)