from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewset, basename='register')
router.register('login', LoginViewset, basename='login')
router.register('users', UserViewset, basename='users')
# brand new viewsets 
router.register('authors', AuthorViewSet)
router.register('categories', CategoryViewSet)
router.register('audiobooks', AudiobookViewSet)
router.register('library', UserLibraryViewSet, basename='library')
router.register('progress', ListeningProgressViewSet, basename='progress')
router.register('ratings', RatingViewSet, basename='ratings')

urlpatterns = router.urls + [
    path('check-email/', check_email_exists, name='check-email'),
]
