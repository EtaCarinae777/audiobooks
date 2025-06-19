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
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg

User = get_user_model()

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
    """ViewSet dla audiobooków - tylko odczyt"""
    queryset = Audiobook.objects.select_related('author', 'category').prefetch_related('chapters')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # Publiczne czytanie, auth dla szczegółów
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AudiobookDetailSerializer
        return AudiobookListSerializer
    
    def get_queryset(self):
        queryset = self.queryset
        
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
        
        # Sortowanie
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in ['title', '-title', 'publication_date', '-publication_date', 'created_at', '-created_at']:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Zwraca polecane audiobooki"""
        featured = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Zwraca popularne audiobooki (na podstawie ocen)"""
        popular = self.queryset.annotate(
            avg_rating=Avg('ratings__rating')
        ).filter(avg_rating__isnull=False).order_by('-avg_rating')[:10]
        
        serializer = self.get_serializer(popular, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def chapters(self, request, pk=None):
        """Zwraca rozdziały audiobooka"""
        audiobook = self.get_object()
        chapters = audiobook.chapters.all()
        serializer = ChapterSerializer(chapters, many=True, context={'request':request})
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