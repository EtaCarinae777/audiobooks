from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
import stripe
from django.conf import settings
from google.auth.transport import requests
from google.oauth2 import id_token
from google.auth.exceptions import GoogleAuthError
from knox.models import AuthToken
import logging

User = get_user_model()
stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)
class LoginViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        
        if serializer.is_valid():
            #do sth
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            user = authenticate(request, email=email, password=password)

            if user:
                #'_, - crate tuple  
                _, token = AuthToken.objects.create(user)
                return Response({
                    "user": self.serializer_class(user).data,
                    "token": token

                }
            )
            else:
                return Response({"error": "Invalid credentials"}, status=400)   
            
        else:
            return Response(serializer.errors, status = 400)

# Create your views here.
class RegisterViewset(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else: 
            return Response(serializer.errors, status=400)
        
class UserViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def list(self, request):
        queryset = User.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

# Nowa funkcja do sprawdzania email
@api_view(['POST'])
@permission_classes([AllowAny])
def check_email_exists(request):
    print(f"Otrzymano request check_email: {request.data}")  # DEBUG
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    
    user_exists = User.objects.filter(email=email).exists()
    print(f"Email {email} exists: {user_exists}")  # DEBUG
    return Response({'exists': user_exists})


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet dla autorów - tylko odczyt"""
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [permissions.AllowAny]  # Publiczne
    
    def get_queryset(self):
        """Dodaje możliwość wyszukiwania autorów"""
        queryset = Author.objects.all()
        
        # Wyszukiwanie
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(bio__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def audiobooks(self, request, pk=None):
        """Zwraca audiobooki danego autora"""
        author = self.get_object()
        audiobooks = author.audiobooks.all()
        serializer = AudiobookListSerializer(audiobooks, many=True, context={'request': request})
        return Response(serializer.data)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet dla kategorii - tylko odczyt"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]  # Publiczne
    
    @action(detail=True, methods=['get'])
    def audiobooks(self, request, pk=None):
        """Zwraca audiobooki z danej kategorii"""
        category = self.get_object()
        audiobooks = category.audiobooks.all()
        serializer = AudiobookListSerializer(audiobooks, many=True, context={'request': request})
        return Response(serializer.data)

class AudiobookViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet dla audiobooków z logiką premium/darmowych"""
    queryset = Audiobook.objects.select_related('author', 'category').prefetch_related('chapters')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AudiobookDetailSerializer
        return AudiobookListSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filtrowanie bez ukrywania premium - po prostu pokazujemy wszystko
        # Premium będzie oznaczone w serializer
        
        # Filtrowanie po kategorii
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__id=category)
        
        # Filtrowanie po autorze
        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(author__id=author)
        
        # Wyszukiwanie
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(author__name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Filtr: tylko darmowe
        free_only = self.request.query_params.get('free_only')
        if free_only == 'true':
            queryset = queryset.filter(is_premium=False)
        
        # Filtr: tylko premium
        premium_only = self.request.query_params.get('premium_only')
        if premium_only == 'true':
            queryset = queryset.filter(is_premium=True)
        
        # Sortowanie
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ['title', '-title', 'publication_date', '-publication_date', 'created_at', '-created_at', 'price', '-price']:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Pobierz szczegóły audiobooka - sprawdź dostęp"""
        audiobook = self.get_object()
        
        # Jeśli premium, sprawdź czy użytkownik kupił
        if audiobook.is_premium and request.user.is_authenticated:
            has_purchased = Purchase.objects.filter(
                user=request.user, 
                audiobook=audiobook,
                payment_status='completed'
            ).exists()
            
            if not has_purchased:
                # Zwróć ograniczone info - bez rozdziałów
                serializer = AudiobookListSerializer(audiobook, context={'request': request})
                data = serializer.data
                data['access_denied'] = True
                data['message'] = f"Ten audiobook kosztuje {audiobook.price} PLN. Kup go, aby uzyskać pełny dostęp."
                return Response(data)
        
        # Pełny dostęp
        serializer = self.get_serializer(audiobook)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        """Zwraca rozdziały - tylko dla zakupionych premium lub darmowych"""
        audiobook = self.get_object()
        
        # Sprawdź dostęp
        if audiobook.is_premium:
            if not request.user.is_authenticated:
                return Response(
                    {"error": "Zaloguj się, aby kupić ten audiobook"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            has_purchased = Purchase.objects.filter(
                user=request.user, 
                audiobook=audiobook,
                payment_status='completed'
            ).exists()
            
            if not has_purchased:
                return Response(
                    {"error": f"Kup ten audiobook za {audiobook.price} PLN, aby uzyskać dostęp do rozdziałów"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        
        chapters = audiobook.chapters.all()
        serializer = ChapterSerializer(chapters, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def purchase(self, request, pk=None):
        """Kup audiobook (na razie bez prawdziwej płatności)"""
        if not request.user.is_authenticated:
            return Response(
                {"error": "Musisz być zalogowany, aby kupować audiobooki"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        audiobook = self.get_object()
        
        if not audiobook.is_premium:
            return Response(
                {"error": "Ten audiobook jest darmowy"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Sprawdź czy już kupiony
        if Purchase.objects.filter(user=request.user, audiobook=audiobook).exists():
            return Response(
                {"message": "Już kupiłeś ten audiobook"}, 
                status=status.HTTP_200_OK
            )
        
        # Utwórz zakup (bez prawdziwej płatności na razie)
        purchase = Purchase.objects.create(
            user=request.user,
            audiobook=audiobook,
            price_paid=audiobook.price,
            payment_status='completed'  # Na razie od razu completed
        )
        
        # Dodaj do biblioteki
        UserLibrary.objects.get_or_create(
            user=request.user,
            audiobook=audiobook
        )
        
        return Response({
            "message": f"Pomyślnie kupiłeś {audiobook.title} za {audiobook.price} PLN",
            "purchase_id": purchase.id
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_purchases(self, request):
        """Zwraca zakupione audiobooki użytkownika"""
        if not request.user.is_authenticated:
            return Response(
                {"error": "Musisz być zalogowany"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        purchases = Purchase.objects.filter(
            user=request.user, 
            payment_status='completed'
        ).select_related('audiobook', 'audiobook__author')
        
        audiobooks = [purchase.audiobook for purchase in purchases]
        serializer = AudiobookListSerializer(audiobooks, many=True, context={'request': request})
        return Response(serializer.data)

class UserLibraryViewSet(viewsets.ModelViewSet):
    """ViewSet dla biblioteki użytkownika"""
    serializer_class = UserLibrarySerializer
    permission_classes = [permissions.IsAuthenticated]  # Tylko zalogowani
    
    def get_queryset(self):
        return UserLibrary.objects.filter(user=self.request.user).select_related('audiobook', 'audiobook__author')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def add_audiobook(self, request):
        """Dodaj audiobook do biblioteki"""
        audiobook_id = request.data.get('audiobook_id')
        if not audiobook_id:
            return Response({'error': 'audiobook_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        audiobook = get_object_or_404(Audiobook, id=audiobook_id)
        library_item, created = UserLibrary.objects.get_or_create(
            user=request.user,
            audiobook=audiobook
        )
        
        if created:
            serializer = self.get_serializer(library_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Audiobook already in library'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def remove_audiobook(self, request):
        """Usuń audiobook z biblioteki"""
        audiobook_id = request.data.get('audiobook_id')
        if not audiobook_id:
            return Response({'error': 'audiobook_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            library_item = UserLibrary.objects.get(user=request.user, audiobook__id=audiobook_id)
            library_item.delete()
            return Response({'message': 'Audiobook removed from library'}, status=status.HTTP_204_NO_CONTENT)
        except UserLibrary.DoesNotExist:
            return Response({'error': 'Audiobook not found in library'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Zwraca ulubione audiobooki"""
        favorites = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def listening(self, request):
        """Audiobooki obecnie słuchane (rozpoczęte ale nie ukończone)"""
        user_library = self.get_queryset()
        listening_audiobooks = []
        
        for item in user_library:
            try:
                progress = ListeningProgress.objects.get(
                    user=request.user, 
                    audiobook=item.audiobook
                )
                if not progress.is_completed:  # Nie ukończone
                    listening_audiobooks.append(item)
            except ListeningProgress.DoesNotExist:
                pass  # Nie rozpoczęte jeszcze
                
        serializer = self.get_serializer(listening_audiobooks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Audiobooki przesłuchane (ukończone)"""
        user_library = self.get_queryset()
        completed_audiobooks = []
        
        for item in user_library:
            try:
                progress = ListeningProgress.objects.get(
                    user=request.user, 
                    audiobook=item.audiobook
                )
                if progress.is_completed:  # ✅ Ukończone
                    completed_audiobooks.append(item)
            except ListeningProgress.DoesNotExist:
                pass
                
        serializer = self.get_serializer(completed_audiobooks, many=True)
        return Response(serializer.data)

class ListeningProgressViewSet(viewsets.ModelViewSet):
    """ViewSet dla postępu słuchania"""
    serializer_class = ListeningProgressSerializer
    permission_classes = [permissions.IsAuthenticated]  # Tylko zalogowani
    
    def get_queryset(self):
        return ListeningProgress.objects.filter(user=self.request.user).select_related(
            'audiobook', 'current_chapter'
        )
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def update_progress(self, request):
        """Aktualizuj postęp słuchania"""
        audiobook_id = request.data.get('audiobook_id')
        chapter_id = request.data.get('chapter_id')
        position_seconds = request.data.get('position_seconds', 0)
        
        if not audiobook_id or not chapter_id:
            return Response({
                'error': 'audiobook_id and chapter_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        audiobook = get_object_or_404(Audiobook, id=audiobook_id)
        chapter = get_object_or_404(Chapter, id=chapter_id, audiobook=audiobook)
        
        progress, created = ListeningProgress.objects.update_or_create(
            user=request.user,
            audiobook=audiobook,
            defaults={
                'current_chapter': chapter,
                'current_position_seconds': position_seconds
            }
        )
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def currently_listening(self, request):
        """Zwraca aktualnie słuchane audiobooki"""
        recent = self.get_queryset().filter(is_completed=False).order_by('-last_listened')[:5]
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)

class RatingViewSet(viewsets.ModelViewSet):
    """ViewSet dla ocen"""
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]  # Tylko zalogowani
    
    def get_queryset(self):
        return Rating.objects.filter(user=self.request.user).select_related('audiobook')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def audiobook_ratings(self, request):
        """Zwraca oceny dla konkretnego audiobooka"""
        audiobook_id = request.query_params.get('audiobook_id')
        if not audiobook_id:
            return Response({'error': 'audiobook_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        ratings = Rating.objects.filter(audiobook__id=audiobook_id).select_related('user')
        serializer = self.get_serializer(ratings, many=True)
        return Response(serializer.data)
    
class PurchaseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet dla zakupów - tylko odczyt"""
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]  # Tylko zalogowani
    
    def get_queryset(self):
        """Zwraca tylko zakupy użytkownika"""
        return Purchase.objects.filter(user=self.request.user).select_related(
            'audiobook', 'audiobook__author'
        ).order_by('-purchased_at')
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Zwraca tylko ukończone zakupy"""
        completed_purchases = self.get_queryset().filter(payment_status='completed')
        serializer = self.get_serializer(completed_purchases, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Zwraca oczekujące zakupy"""
        pending_purchases = self.get_queryset().filter(payment_status='pending')
        serializer = self.get_serializer(pending_purchases, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def total_spent(self, request):
        """Zwraca łączną kwotę wydaną przez użytkownika"""
        from django.db.models import Sum
        total = self.get_queryset().filter(payment_status='completed').aggregate(
            total=Sum('price_paid')
        )['total'] or 0
        
        return Response({
            'total_spent': float(total),
            'currency': 'PLN'
        })
    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    """Utwórz PaymentIntent przez Stripe"""
    try:
        audiobook_id = request.data.get('audiobook_id')
        audiobook = get_object_or_404(Audiobook, id=audiobook_id)
        
        # Sprawdź czy już kupiony
        if Purchase.objects.filter(user=request.user, audiobook=audiobook).exists():
            return Response({'error': 'Już kupiłeś ten audiobook'}, status=400)
        
        # Utwórz PaymentIntent przez prawdziwy Stripe
        payment_intent = stripe.PaymentIntent.create(
            amount=int(float(audiobook.price) * 100),  # w groszach
            currency='pln',
            metadata={
                'audiobook_id': str(audiobook.id),
                'user_id': str(request.user.id)
            }
        )
        
        return Response({
            'client_secret': payment_intent.client_secret,
            'audiobook': {
                'id': audiobook.id, 
                'title': audiobook.title,
                'price': str(audiobook.price)
            }
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_payment(request):
    """Potwierdź płatność po sukcesie"""
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        
        # Sprawdź status w Stripe
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if payment_intent.status == 'succeeded':
            audiobook_id = payment_intent.metadata['audiobook_id']
            audiobook = get_object_or_404(Audiobook, id=audiobook_id)
            
            # Utwórz zakup
            Purchase.objects.create(
                user=request.user,
                audiobook=audiobook,
                price_paid=audiobook.price,
                payment_id=payment_intent_id,
                payment_status='completed'
            )
            
            # Dodaj do biblioteki
            UserLibrary.objects.get_or_create(
                user=request.user,
                audiobook=audiobook
            )
            
            return Response({'message': f'Zakupiono {audiobook.title}!'})
        
        return Response({'error': 'Płatność nieudana'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_stripe_config(request):
    """Zwróć klucz publiczny Stripe"""
    return Response({
        'publishable_key': settings.STRIPE_PUBLISHABLE_KEY
    })

# do Gogla ni
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Endpoint do logowania przez Google OAuth z Knox
    """
    token = request.data.get('token')
    
    if not token:
        return Response(
            {'error': 'Token jest wymagany'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Weryfikacja tokenu z Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60  # Dopuszczalny margines czasu
            
        )
        
        # Sprawdź czy token jest dla naszej aplikacji
        if idinfo['aud'] != settings.GOOGLE_CLIENT_ID:
            logger.error(f"Token audience mismatch: {idinfo['aud']}")
            return Response(
                {'error': 'Nieprawidłowy token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Pobierz dane użytkownika z tokenu
        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        profile_picture = idinfo.get('picture', '')
        
        logger.info(f"Google auth attempt for email: {email}")
        
        # Sprawdź czy użytkownik już istnieje
        user = None
        created = False
        
        # Najpierw sprawdź po google_id
        if google_id:
            try:
                user = User.objects.get(google_id=google_id)
            except User.DoesNotExist:
                pass
        
        # Jeśli nie znaleziono po google_id, sprawdź po email
        if not user:
            try:
                user = User.objects.get(email=email)
                # Połącz istniejące konto z Google
                user.google_id = google_id
                user.profile_picture = profile_picture
                user.save()
                logger.info(f"Linked existing account {email} with Google")
            except User.DoesNotExist:
                # Utwórz nowego użytkownika
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    profile_picture=profile_picture
                )
                created = True
                logger.info(f"Created new user via Google: {email}")
        
        # KNOX - utwórz token (automatycznie usuwa stare tokeny jeśli przekroczony limit)
        instance, knox_token = AuthToken.objects.create(user=user)
        
        # Przygotuj odpowiedź
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile_picture': user.profile_picture,
        }
        
        return Response({
            'token': knox_token,  # Knox token (nie .key!)
            'user': user_data,
            'created': created,
            'message': 'Pomyślnie zalogowano przez Google'
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        logger.error(f"Google token verification failed: {str(e)}")
        return Response(
            {'error': 'Nieprawidłowy token Google'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except GoogleAuthError as e:
        logger.error(f"Google auth error: {str(e)}")
        return Response(
            {'error': 'Błąd weryfikacji Google'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Unexpected error in google_auth: {str(e)}")
        return Response(
            {'error': 'Wystąpił nieoczekiwany błąd'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
