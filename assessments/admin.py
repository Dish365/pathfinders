from django.contrib import admin
from .models import Question, Assessment, GiftProfile, AssessmentResult

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'completion_status', 'timestamp', 'created_at')
    search_fields = ('title', 'description', 'user__username')
    list_filter = ('completion_status', 'created_at')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('category', 'text', 'weight', 'assessment')
    list_filter = ('category', 'assessment', 'created_at')
    search_fields = ('text', 'category')

@admin.register(GiftProfile)
class GiftProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'primary_gift', 'timestamp')
    list_filter = ('primary_gift', 'timestamp')
    search_fields = ('user__username', 'primary_gift')

@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'assessment', 'primary_gift', 'secondary_gift', 'timestamp')
    list_filter = ('assessment', 'primary_gift', 'timestamp')
    search_fields = ('user__username', 'user__email', 'primary_gift', 'secondary_gift')
