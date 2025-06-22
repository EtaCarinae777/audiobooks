"""
Integration tests - testing complete workflows
"""
from django.test import TestCase, TransactionTestCase
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from users.models import Author, Category, Audiobook, Chapter, UserLibrary, Purchase
from decimal import Decimal

User = get_user_model()


class CompleteUserJourneyTest(APITestCase):
    
    def test_full_user_workflow(self):

        register_url = reverse('register-list')
        user_data = {
            'email': 'journey@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(register_url, user_data)
        self.assertEqual(response.status_code, 200)

        login_url = reverse('login-list')
        response = self.client.post(login_url, user_data)
        self.assertEqual(response.status_code, 200)
        token = response.data['token']

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

        author = Author.objects.create(name="Journey Author")
        category = Category.objects.create(name="Journey Category")
        audiobook = Audiobook.objects.create(
            title='Journey Audiobook',
            description='Test audiobook for journey',
            author=author,
            category=category,
            narrator='Journey Narrator',
            duration_minutes=60,
            publication_date='2023-01-01',
            is_premium=False
        )
        chapter = Chapter.objects.create(
            audiobook=audiobook,
            title="Chapter 1",
            chapter_number=1,
            duration_seconds=1800,
            audio_file="journey_audio.mp3"
        )

        browse_url = reverse('audiobook-list')
        response = self.client.get(browse_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        library_url = reverse('library-add-audiobook')
        response = self.client.post(library_url, {'audiobook_id': audiobook.pk})
        self.assertEqual(response.status_code, 201)

        progress_url = reverse('progress-update-progress')
        response = self.client.post(progress_url, {
            'audiobook_id': audiobook.pk,
            'chapter_id': chapter.pk,
            'position_seconds': 300
        })
        self.assertEqual(response.status_code, 200)

        rating_url = reverse('ratings-list')
        response = self.client.post(rating_url, {
            'audiobook': audiobook.pk,
            'rating': 5,
            'review': 'Great test audiobook!'
        })
        self.assertEqual(response.status_code, 201)

        library_list_url = reverse('library-list')
        response = self.client.get(library_list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)


class PremiumContentWorkflowTest(APITestCase):

    def test_premium_purchase_workflow(self):

        user = User.objects.create_user(
            email='premium@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=user)
        
        author = Author.objects.create(name="Premium Author")
        category = Category.objects.create(name="Premium Category")
        premium_audiobook = Audiobook.objects.create(
            title='Premium Test Audiobook',
            description='Premium content for testing',
            author=author,
            category=category,
            narrator='Premium Narrator',
            duration_minutes=180,
            publication_date='2023-01-01',
            is_premium=True,
            price=Decimal('29.99')
        )
        chapter = Chapter.objects.create(
            audiobook=premium_audiobook,
            title="Premium Chapter",
            chapter_number=1,
            duration_seconds=1800,
            audio_file="premium_audio.mp3"
        )

        detail_url = reverse('audiobook-detail', kwargs={'pk': premium_audiobook.pk})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('access_denied', False))

        chapters_url = reverse('audiobook-chapters', kwargs={'pk': premium_audiobook.pk})
        response = self.client.get(chapters_url)
        self.assertEqual(response.status_code, 403)

        Purchase.objects.create(
            user=user,
            audiobook=premium_audiobook,
            price_paid=premium_audiobook.price,
            payment_status='completed'
        )

        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('access_denied', response.data)

        response = self.client.get(chapters_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)