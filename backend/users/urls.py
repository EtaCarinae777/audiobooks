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
router.register('purchases', PurchaseViewSet, basename='purchases')

urlpatterns = router.urls + [
    path('check-email/', check_email_exists, name='check-email'),
    path('payments/create-intent/', create_payment_intent, name='create-payment-intent'),
    path('payments/confirm/', confirm_payment, name='confirm-payment'),
    path('payments/config/', get_stripe_config, name='stripe-config'),
]
