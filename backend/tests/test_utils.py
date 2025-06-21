"""
Test utilities and helper functions
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from users.models import Author, Category, Audiobook
from decimal import Decimal

User = get_user_model()


class TestDataFactory:
    """Factory for creating test data"""
    
    @staticmethod
    def create_user(email="test@example.com", password="testpass123", **kwargs):
        """Create a test user"""
        return User.objects.create_user(
            email=email,
            password=password,
            **kwargs
        )
    
    @staticmethod
    def create_author(name="Test Author", bio="Test bio"):
        """Create a test author"""
        return Author.objects.create(name=name, bio=bio)
    
    @staticmethod
    def create_category(name="Test Category", description="Test description"):
        """Create a test category"""
        return Category.objects.create(name=name, description=description)
    
    @staticmethod
    def create_audiobook(title="Test Audiobook", is_premium=False, price=None, **kwargs):
        """Create a test audiobook"""
        if 'author' not in kwargs:
            kwargs['author'] = TestDataFactory.create_author()
        if 'category' not in kwargs:
            kwargs['category'] = TestDataFactory.create_category()
        
        defaults = {
            'description': 'Test audiobook description',
            'narrator': 'Test Narrator',
            'duration_minutes': 120,
            'publication_date': '2023-01-01',
            'is_premium': is_premium,
            'price': price
        }
        defaults.update(kwargs)
        
        return Audiobook.objects.create(title=title, **defaults)


class BaseTestCase(TestCase):
    """Base test case with common setup"""
    
    def setUp(self):
        """Common test setup"""
        self.factory = TestDataFactory()
        self.user = self.factory.create_user()
        self.author = self.factory.create_author()
        self.category = self.factory.create_category()
        self.free_audiobook = self.factory.create_audiobook(
            title="Free Test Audiobook",
            author=self.author,
            category=self.category
        )
        self.premium_audiobook = self.factory.create_audiobook(
            title="Premium Test Audiobook",
            author=self.author,
            category=self.category,
            is_premium=True,
            price=Decimal('19.99')
        )