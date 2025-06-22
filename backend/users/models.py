from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from .utils import audiobook_cover_path, audiobook_audio_path, validate_audio_file, validate_image_file

class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using = self._db)
        return user
          
    def create_superuser(self, email, password=None, **extra_fields):

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)




class CustomUser(AbstractUser):
    email = models.EmailField(max_length = 200, unique = True)
    birthday = models.DateField(null = True, blank = True)
    username = models.CharField(max_length=200, null=True, blank=True)

    google_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    profile_picture = models.URLField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

# TO DO ------------------------- !
# class UserProfile DO ZROBIENIA 

class Author(models.Model):
    name = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
   
    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Audiobook(models.Model):
    title = models.CharField(max_length=300)
    description = models.TextField()
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='audiobooks')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='audiobooks')
    narrator = models.CharField(max_length=200)
    cover_image = models.ImageField(
        upload_to=audiobook_cover_path, 
        null=True, 
        blank=True,
        validators=[validate_image_file],
        help_text="Okładka audiobooka (JPG, PNG, max 10MB)"
    )
    duration_minutes = models.PositiveIntegerField()
    publication_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)

    is_premium = models.BooleanField(
        default=False, 
        verbose_name="Premium audiobook",
        help_text="Czy audiobook wymaga zakupu (płatny)"
    )
    price = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Cena",
        help_text="Cena w PLN (tylko dla premium)"
    )
    
    def __str__(self):
        premium_marker = f" [PREMIUM - {self.price} PLN]" if self.is_premium else " [FREE]"
        return f"{self.title} - {self.author.name}{premium_marker}"
    
    @property
    def duration_formatted(self):
        hours = self.duration_minutes // 60
        minutes = self.duration_minutes % 60
        return f"{hours}h {minutes}m"
    

class Chapter(models.Model):
    audiobook = models.ForeignKey(Audiobook, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=200)
    chapter_number = models.PositiveIntegerField()
    audio_file = models.FileField(
        upload_to=audiobook_audio_path,
        validators=[validate_audio_file],
        help_text="Plik audio rozdziału (MP3, M4A, WAV, max 500MB)"
    )
    duration_seconds = models.PositiveIntegerField()
    
    class Meta:
        ordering = ['chapter_number']
        unique_together = ['audiobook', 'chapter_number']
    
    def __str__(self):
        return f"{self.audiobook.title} - Chapter {self.chapter_number}: {self.title}"

class UserLibrary(models.Model):

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='library')  # ← ZMIANA
    audiobook = models.ForeignKey(Audiobook, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    is_favorite = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'audiobook']
    
    def __str__(self):
        return f"{self.user.username} - {self.audiobook.title}"

class ListeningProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # ← ZMIANA
    audiobook = models.ForeignKey(Audiobook, on_delete=models.CASCADE)
    current_chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    current_position_seconds = models.PositiveIntegerField(default=0)  # pozycja w rozdziale
    last_listened = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'audiobook']
    
    def __str__(self):
        return f"{self.user.username} - {self.audiobook.title} - Chapter {self.current_chapter.chapter_number}"
    
    @property
    def progress_percentage(self):
        total_seconds = sum(chapter.duration_seconds for chapter in self.audiobook.chapters.all())
        
        completed_chapters = self.audiobook.chapters.filter(chapter_number__lt=self.current_chapter.chapter_number)
        completed_seconds = sum(chapter.duration_seconds for chapter in completed_chapters)
        
        current_seconds = completed_seconds + self.current_position_seconds
        
        if total_seconds > 0:
            return round((current_seconds / total_seconds) * 100, 2)
        return 0

class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    audiobook = models.ForeignKey(Audiobook, on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'audiobook']
    
    def __str__(self):
        return f"{self.user.username} - {self.audiobook.title} - {self.rating}/5"
    

class Purchase(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='purchases')
    audiobook = models.ForeignKey(Audiobook, on_delete=models.CASCADE, related_name='purchases')
    price_paid = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Zapłacona cena")
    purchased_at = models.DateTimeField(auto_now_add=True)
    
    payment_id = models.CharField(max_length=100, null=True, blank=True, help_text="ID płatności ze Stripe")
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Oczekująca'),
            ('completed', 'Zakończona'),
            ('failed', 'Nieudana'),
            ('refunded', 'Zwrócona'),
        ],
        default='completed'
    )
    
    class Meta:
        unique_together = ['user', 'audiobook']
        verbose_name = "Purchase"
        verbose_name_plural = "Purchases"
    
    def __str__(self):
        return f"{self.user.email} bought {self.audiobook.title} for {self.price_paid} PLN"