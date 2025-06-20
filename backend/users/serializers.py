from rest_framework import serializers
from .models import *

from django.contrib.auth import get_user_model
User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret

class RegisterSerializer(serializers.ModelSerializer):

    class Meta :
        model = User
        fields= ('id', 'email', 'password')
        #extra_krawrgs chroni przed wyswietlaniem hasla w odpowiedziach api
        extra_kwargs = { 'password': {'write_only': True} }

    def create(self, validated_data):
         #tworzy nowego użytkownika za pomoca modelu User 
         #pan mowi ze to bezpieczne XD
        user = User.objects.create_user(**validated_data)
        return user
        
class UserAccountSerializer(serializers.ModelSerializer):
    plan_display_name = serializers.CharField(source='get_plan_display_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'plan', 'plan_display_name', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'plan_display_name']

class AuthorSerializer(serializers.ModelSerializer):
    audiobooks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Author
        fields = ['id', 'name', 'bio', 'audiobooks_count']
    
    def get_audiobooks_count(self, obj):
        return obj.audiobooks.count()

class CategorySerializer(serializers.ModelSerializer):
    audiobooks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'audiobooks_count']
    
    def get_audiobooks_count(self, obj):
        return obj.audiobooks.count()

class ChapterSerializer(serializers.ModelSerializer):
    duration_formatted = serializers.SerializerMethodField()
    audio_file = serializers.SerializerMethodField()  # ← Dodaj to
    
    class Meta:
        model = Chapter
        fields = ['id', 'title', 'chapter_number', 'audio_file', 'duration_seconds', 'duration_formatted']
    
    def get_duration_formatted(self, obj):
        minutes = obj.duration_seconds // 60
        seconds = obj.duration_seconds % 60
        return f"{minutes}:{seconds:02d}"
    
    def get_audio_file(self, obj):
        """Zwraca pełny URL do pliku audio"""
        if obj.audio_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None

class AudiobookListSerializer(serializers.ModelSerializer):
    """Uproszczony serializer dla listy audiobooków"""
    author_name = serializers.CharField(source='author.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    is_in_library = serializers.SerializerMethodField()
    is_purchased = serializers.SerializerMethodField()  # Czy użytkownik kupił
    
    class Meta:
        model = Audiobook
        fields = [
            'id', 'title', 'author_name', 'category_name', 'narrator',
            'cover_image', 'duration_formatted', 'average_rating', 
            'is_featured', 'is_premium', 'price', 'is_in_library', 'is_purchased'
        ]
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings:
            return round(sum(r.rating for r in ratings) / len(ratings), 1)
        return None
    
    def get_is_in_library(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserLibrary.objects.filter(user=request.user, audiobook=obj).exists()
        return False
    
    def get_is_purchased(self, obj):
        """Sprawdza czy użytkownik kupił ten audiobook"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Purchase.objects.filter(
                user=request.user, 
                audiobook=obj,
                payment_status='completed'
            ).exists()
        return False


class PurchaseSerializer(serializers.ModelSerializer):
    """Serializer dla zakupów"""
    audiobook_title = serializers.CharField(source='audiobook.title', read_only=True)
    audiobook_author = serializers.CharField(source='audiobook.author.name', read_only=True)
    audiobook_cover = serializers.CharField(source='audiobook.cover_image', read_only=True)
    
    class Meta:
        model = Purchase
        fields = [
            'id', 'audiobook', 'audiobook_title', 'audiobook_author', 'audiobook_cover',
            'price_paid', 'purchased_at', 'payment_status', 'payment_id'
        ]
        read_only_fields = ['user']


class AudiobookDetailSerializer(serializers.ModelSerializer):
    """Szczegółowy serializer dla pojedynczego audiobooka"""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    chapters = ChapterSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()
    is_in_library = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Audiobook
        fields = [
            'id', 'title', 'description', 'author', 'category', 'narrator',
            'cover_image', 'duration_minutes', 'duration_formatted', 
            'publication_date', 'chapters', 'average_rating', 'ratings_count',
            'is_in_library', 'user_progress'
        ]
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings:
            return round(sum(r.rating for r in ratings) / len(ratings), 1)
        return None
    
    def get_ratings_count(self, obj):
        return obj.ratings.count()
    
    def get_is_in_library(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserLibrary.objects.filter(user=request.user, audiobook=obj).exists()
        return False
    
    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Purchase.objects.filter(
                user=request.user, 
                audiobook=obj,
                payment_status='completed'
            ).exists()
        return False
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = ListeningProgress.objects.get(user=request.user, audiobook=obj)
                return {
                    'current_chapter': progress.current_chapter.chapter_number,
                    'current_position_seconds': progress.current_position_seconds,
                    'progress_percentage': progress.progress_percentage,
                    'is_completed': progress.is_completed
                }
            except ListeningProgress.DoesNotExist:
                return None
        return None

class UserLibrarySerializer(serializers.ModelSerializer):
    audiobook = AudiobookListSerializer(read_only=True)
    
    class Meta:
        model = UserLibrary
        fields = ['id', 'audiobook', 'added_at', 'is_favorite']

class ListeningProgressSerializer(serializers.ModelSerializer):
    audiobook_title = serializers.CharField(source='audiobook.title', read_only=True)
    chapter_title = serializers.CharField(source='current_chapter.title', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = ListeningProgress
        fields = [
            'id', 'audiobook', 'audiobook_title', 'current_chapter', 
            'chapter_title', 'current_position_seconds', 'progress_percentage',
            'last_listened', 'is_completed'
        ]
        read_only_fields = ['user']

class RatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    audiobook_title = serializers.CharField(source='audiobook.title', read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'user_name', 'audiobook', 'audiobook_title', 'rating', 'review', 'created_at']
        read_only_fields = ['user']
    
    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value