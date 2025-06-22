"""
Model tests - organized and clean
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from datetime import date
from decimal import Decimal

from users.models import (
    Author, Category, Audiobook, Chapter, UserLibrary, 
    ListeningProgress, Rating, Purchase
)

User = get_user_model()


class UserModelTest(TestCase):
    
    def setUp(self):
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_create_user(self):
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpassword123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)
    
    def test_create_superuser(self):
        superuser = User.objects.create_superuser(**self.user_data)
        self.assertEqual(superuser.email, 'test@example.com')
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
    
    def test_email_required(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='testpassword123')
    
    def test_email_unique(self):
        User.objects.create_user(**self.user_data)
        with self.assertRaises(IntegrityError):
            User.objects.create_user(**self.user_data)


class AudiobookModelTest(TestCase):

    def setUp(self):
        self.author = Author.objects.create(
            name="Test Author",
            bio="Test author biography"
        )
        self.category = Category.objects.create(
            name="Fantasy",
            description="Fantasy audiobooks"
        )
        self.audiobook_data = {
            'title': 'Test Audiobook',
            'description': 'Test audiobook description',
            'author': self.author,
            'category': self.category,
            'narrator': 'Test Narrator',
            'duration_minutes': 120,
            'publication_date': date(2023, 1, 1),
            'is_premium': False,
            'price': None
        }
    
    def test_create_free_audiobook(self):
        audiobook = Audiobook.objects.create(**self.audiobook_data)
        self.assertEqual(audiobook.title, 'Test Audiobook')
        self.assertFalse(audiobook.is_premium)
        self.assertIsNone(audiobook.price)
        self.assertIn("[FREE]", str(audiobook))
    
    def test_create_premium_audiobook(self):
        self.audiobook_data.update({
            'is_premium': True,
            'price': Decimal('29.99')
        })
        audiobook = Audiobook.objects.create(**self.audiobook_data)
        self.assertTrue(audiobook.is_premium)
        self.assertEqual(audiobook.price, Decimal('29.99'))
        self.assertIn("[PREMIUM", str(audiobook))
    
    def test_duration_formatted(self):
        audiobook = Audiobook.objects.create(**self.audiobook_data)
        self.assertEqual(audiobook.duration_formatted, "2h 0m")
        
        audiobook.duration_minutes = 150
        audiobook.save()
        self.assertEqual(audiobook.duration_formatted, "2h 30m")


class UserInteractionModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='interaction@example.com',
            password='testpass123'
        )
        self.author = Author.objects.create(name="Interaction Author")
        self.category = Category.objects.create(name="Interaction Category")
        self.audiobook = Audiobook.objects.create(
            title='Interaction Test Audiobook',
            description='Test description',
            author=self.author,
            category=self.category,
            narrator='Test Narrator',
            duration_minutes=120,
            publication_date=date(2023, 1, 1)
        )
        self.chapter = Chapter.objects.create(
            audiobook=self.audiobook,
            title="Test Chapter",
            chapter_number=1,
            duration_seconds=1800,
            audio_file="test_audio.mp3"
        )
    
    def test_user_library(self):
        library_entry = UserLibrary.objects.create(
            user=self.user,
            audiobook=self.audiobook,
            is_favorite=True
        )
        self.assertTrue(library_entry.is_favorite)
        self.assertIn(self.audiobook.title, str(library_entry))
    
    def test_listening_progress(self):
        progress = ListeningProgress.objects.create(
            user=self.user,
            audiobook=self.audiobook,
            current_chapter=self.chapter,
            current_position_seconds=600
        )
        self.assertEqual(progress.current_position_seconds, 600)
        self.assertFalse(progress.is_completed)
    
    def test_rating_system(self):
        rating = Rating.objects.create(
            user=self.user,
            audiobook=self.audiobook,
            rating=5,
            review="Excellent audiobook!"
        )
        self.assertEqual(rating.rating, 5)
        self.assertIn("5/5", str(rating))
    
    def test_purchase_system(self):
        purchase = Purchase.objects.create(
            user=self.user,
            audiobook=self.audiobook,
            price_paid=Decimal('19.99'),
            payment_status='completed'
        )
        self.assertEqual(purchase.price_paid, Decimal('19.99'))
        self.assertEqual(purchase.payment_status, 'completed')

