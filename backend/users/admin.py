from django.contrib import admin
from .models import *
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .utils import get_file_size_display
# Register your models here.

admin.site.register(CustomUser)

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['name', 'audiobooks_count']
    search_fields = ['name']
    ordering = ['name']
    
    def audiobooks_count(self, obj):
        return obj.audiobooks.count()
    audiobooks_count.short_description = 'Liczba audiobooków'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'audiobooks_count']
    search_fields = ['name']
    
    def audiobooks_count(self, obj):
        return obj.audiobooks.count()
    audiobooks_count.short_description = 'Liczba audiobooków'

class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1
    fields = ['chapter_number', 'title', 'audio_file', 'file_size_display', 'duration_seconds']
    readonly_fields = ['file_size_display']
    ordering = ['chapter_number']
    
    def file_size_display(self, obj):
        if obj.audio_file:
            return get_file_size_display(obj.audio_file.size)
        return "Brak pliku"
    file_size_display.short_description = 'Rozmiar pliku'

@admin.register(Audiobook)
class AudiobookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'cover_preview', 'chapters_count', 
                   'total_file_size', 'is_featured', 'created_at']
    list_filter = ['category', 'author', 'is_featured', 'publication_date']
    search_fields = ['title', 'author__name', 'narrator']
    readonly_fields = ['cover_preview', 'total_file_size', 'created_at']
    
    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('title', 'author', 'category', 'description')
        }),
        ('Media', {
            'fields': ('cover_image', 'cover_preview')
        }),
        ('Szczegóły', {
            'fields': ('narrator', 'duration_minutes', 'publication_date')
        }),
        ('Ustawienia', {
            'fields': ('is_featured',)
        }),
        ('Statystyki', {
            'fields': ('total_file_size', 'created_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [ChapterInline]
    
    def cover_preview(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 300px;" />',
                obj.cover_image.url
            )
        return "Brak okładki"
    cover_preview.short_description = 'Podgląd okładki'
    
    def chapters_count(self, obj):
        return obj.chapters.count()
    chapters_count.short_description = 'Rozdziały'
    
    def total_file_size(self, obj):
        total_size = 0
        if obj.cover_image:
            total_size += obj.cover_image.size
        
        for chapter in obj.chapters.all():
            if chapter.audio_file:
                total_size += chapter.audio_file.size
        
        return get_file_size_display(total_size)
    total_file_size.short_description = 'Całkowity rozmiar plików'

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['audiobook', 'chapter_number', 'title', 'audio_file_info', 'duration_formatted']
    list_filter = ['audiobook']
    search_fields = ['title', 'audiobook__title']
    readonly_fields = ['audio_file_info']
    
    def audio_file_info(self, obj):
        if obj.audio_file:
            size = get_file_size_display(obj.audio_file.size)
            return format_html(
                '<a href="{}" target="_blank">🎵 {}</a><br/><small>Rozmiar: {}</small>',
                obj.audio_file.url,
                obj.audio_file.name.split('/')[-1],
                size
            )
        return "Brak pliku"
    audio_file_info.short_description = 'Plik audio'
    
    def duration_formatted(self, obj):
        minutes = obj.duration_seconds // 60
        seconds = obj.duration_seconds % 60
        return f"{minutes}:{seconds:02d}"
    duration_formatted.short_description = 'Czas trwania'

@admin.register(UserLibrary)
class UserLibraryAdmin(admin.ModelAdmin):
    list_display = ['user', 'audiobook', 'added_at', 'is_favorite']
    list_filter = ['is_favorite', 'added_at', 'audiobook__category']
    search_fields = ['user__username', 'audiobook__title']
    date_hierarchy = 'added_at'

@admin.register(ListeningProgress)
class ListeningProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'audiobook', 'current_chapter', 'progress_percentage', 
                   'is_completed', 'last_listened']
    list_filter = ['is_completed', 'last_listened', 'audiobook__category']
    search_fields = ['user__username', 'audiobook__title']
    readonly_fields = ['progress_percentage']
    date_hierarchy = 'last_listened'
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage}%"
    progress_percentage.short_description = 'Postęp'

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'audiobook', 'rating', 'created_at', 'review_preview']
    list_filter = ['rating', 'created_at', 'audiobook__category']
    search_fields = ['user__username', 'audiobook__title', 'review']
    date_hierarchy = 'created_at'
    
    def review_preview(self, obj):
        if obj.review:
            return obj.review[:50] + "..." if len(obj.review) > 50 else obj.review
        return "Brak recenzji"
    review_preview.short_description = 'Recenzja (podgląd)'

# Dodatkowe konfiguracje
admin.site.site_header = "Panel Administracyjny - Audiobooki"
admin.site.site_title = "Audiobooki Admin"
admin.site.index_title = "Zarządzanie Audiobookami"