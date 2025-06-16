from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

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