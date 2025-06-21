# backend/tests/test_views.py
"""
API view tests - organized and clean
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from users.models import Author, Category, Audiobook, UserLibrary
from decimal import Decimal

User = get_user_model()


class AuthenticationAPITest(APITestCase):
    """Test authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'email': 'apitest@example.com',
            'password': 'testpassword123'
        }
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        register_url = reverse('register-list')
        response = self.client.post(register_url, self.user_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(email='apitest@example.com').exists())
    
    def test_user_login(self):
        """Test user login endpoint"""
        # Create user first
        User.objects.create_user(**self.user_data)
        
        login_url = reverse('login-list')
        response = self.client.post(login_url, self.user_data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
    
    def test_email_check(self):
        """Test email existence check endpoint"""
        User.objects.create_user(**self.user_data)
        
        check_url = reverse('check-email')
        response = self.client.post(check_url, {'email': 'apitest@example.com'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['exists'])


class AudiobookAPITest(APITestCase):
    """Test audiobook endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='audiobook@example.com',
            password='testpass123'
        )
        
        # Create test data
        self.author = Author.objects.create(name="API Author")
        self.category = Category.objects.create(name="API Category")
        
        self.free_audiobook = Audiobook.objects.create(
            title='Free API Audiobook',
            description='Free audiobook for API testing',
            author=self.author,
            category=self.category,
            narrator='API Narrator',
            duration_minutes=90,
            publication_date='2023-01-01',
            is_premium=False
        )
        
        self.premium_audiobook = Audiobook.objects.create(
            title='Premium API Audiobook',
            description='Premium audiobook for API testing',
            author=self.author,
            category=self.category,
            narrator='API Narrator',
            duration_minutes=120,
            publication_date='2023-01-01',
            is_premium=True,
            price=Decimal('25.99')
        )
    
    def test_audiobook_list(self):
        """Test audiobook listing endpoint"""
        url = reverse('audiobook-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_audiobook_search(self):
        """Test audiobook search functionality"""
        url = reverse('audiobook-list')
        response = self.client.get(url, {'search': 'Free'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Free API Audiobook')
    
    def test_audiobook_filtering(self):
        """Test audiobook filtering"""
        url = reverse('audiobook-list')
        
        # Test free only
        response = self.client.get(url, {'free_only': 'true'})
        self.assertEqual(len(response.data), 1)
        self.assertFalse(response.data[0]['is_premium'])
        
        # Test premium only
        response = self.client.get(url, {'premium_only': 'true'})
        self.assertEqual(len(response.data), 1)
        self.assertTrue(response.data[0]['is_premium'])


class UserLibraryAPITest(APITestCase):
    """Test user library endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='library@example.com',
            password='testpass123'
        )
        
        self.author = Author.objects.create(name="Library Author")
        self.category = Category.objects.create(name="Library Category")
        self.audiobook = Audiobook.objects.create(
            title='Library Test Audiobook',
            description='Test audiobook for library',
            author=self.author,
            category=self.category,
            narrator='Library Narrator',
            duration_minutes=100,
            publication_date='2023-01-01',
            is_premium=False
        )
    
    def test_library_requires_authentication(self):
        """Test that library endpoints require authentication"""
        url = reverse('library-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_add_to_library(self):
        """Test adding audiobook to user library"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('library-add-audiobook')
        response = self.client.post(url, {'audiobook_id': self.audiobook.pk})
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            UserLibrary.objects.filter(
                user=self.user, 
                audiobook=self.audiobook
            ).exists()
        )
    
    def test_list_library(self):
        """Test listing user's library"""
        self.client.force_authenticate(user=self.user)
        
        # Add audiobook to library first
        UserLibrary.objects.create(
            user=self.user,
            audiobook=self.audiobook,
            is_favorite=True
        )
        
        url = reverse('library-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertTrue(response.data[0]['is_favorite'])