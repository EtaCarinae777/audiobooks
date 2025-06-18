# utils.py - Funkcje pomocnicze dla plików
import os
from django.core.exceptions import ValidationError
from django.conf import settings

def audiobook_cover_path(instance, filename):
    """Generuje ścieżkę dla okładki audiobooka"""
    # Pobierz rozszerzenie pliku
    ext = filename.split('.')[-1].lower()
    
    # Utwórz nową nazwę pliku na podstawie ID audiobooka i tytułu
    safe_title = "".join(c for c in instance.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
    safe_title = safe_title.replace(' ', '_')[:50]  # Max 50 znaków
    
    # Struktura: covers/YYYY/MM/audiobook_id_title.ext
    from datetime import datetime
    now = datetime.now()
    
    return f'covers/{now.year}/{now.month:02d}/{instance.id or "new"}_{safe_title}.{ext}'

def audiobook_audio_path(instance, filename):
    """Generuje ścieżkę dla pliku audio rozdziału"""
    # Pobierz rozszerzenie pliku
    ext = filename.split('.')[-1].lower()
    
    # Bezpieczna nazwa audiobooka
    safe_title = "".join(c for c in instance.audiobook.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
    safe_title = safe_title.replace(' ', '_')[:30]
    
    # Struktura: audiobooks/audiobook_title/chapter_XX.ext
    return f'audiobooks/{safe_title}/chapter_{instance.chapter_number:02d}.{ext}'

def validate_audio_file(value):
    """Walidator dla plików audio"""
    if not value:
        return
    
    # Sprawdź rozszerzenie
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in getattr(settings, 'ALLOWED_AUDIO_EXTENSIONS', ['.mp3', '.m4a', '.wav']):
        raise ValidationError(f'Nieprawidłowy format pliku. Dozwolone: {", ".join(settings.ALLOWED_AUDIO_EXTENSIONS)}')
    
    # Sprawdź rozmiar (max 500MB)
    max_size = 500 * 1024 * 1024  # 500MB
    if value.size > max_size:
        raise ValidationError(f'Plik jest za duży. Maksymalny rozmiar: {max_size / (1024*1024):.0f}MB')

def validate_image_file(value):
    """Walidator dla plików obrazów"""
    if not value:
        return
    
    # Sprawdź rozszerzenie
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in getattr(settings, 'ALLOWED_IMAGE_EXTENSIONS', ['.jpg', '.jpeg', '.png']):
        raise ValidationError(f'Nieprawidłowy format obrazu. Dozwolone: {", ".join(settings.ALLOWED_IMAGE_EXTENSIONS)}')
    
    # Sprawdź rozmiar (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    if value.size > max_size:
        raise ValidationError(f'Obraz jest za duży. Maksymalny rozmiar: {max_size / (1024*1024):.0f}MB')

def get_file_size_display(size_bytes):
    """Konwertuje rozmiar pliku na czytelny format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB"]
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_names[i]}"