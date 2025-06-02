from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

# Create your models here.
class CustomUserManager(BaseUserManager):
    """
        Niestandardowy manager dla modelu CustomUser.
        Odpowiada za tworzenie użytkowników i superużytkowników z email jako głównym identyfikatorem.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        # Hashuje i ustawia hasło
        user.set_password(password)
        user.save(using = self._db)
        return user
        
    # Custom user model manager where email is the unique identifier    
    def create_superuser(self, email, password=None, **extra_fields):

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)



# Create your models here.
class CustomUser(AbstractUser):
    email = models.EmailField(max_length = 200, unique = True)
    birthday = models.DateField(null = True, blank = True)
    username = models.CharField(max_length=200, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    