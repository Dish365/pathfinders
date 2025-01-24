# books/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify

class Book(models.Model):
    """
    Model for motivational gift guidance books like 'The Gift of Serving'
    Each book corresponds to a specific motivational gift from the assessment
    """
    GIFT_CHOICES = [
        ('PERCEPTION', 'Perception (Prophecy)'),
        ('SERVICE', 'Service'),
        ('TEACHING', 'Teaching'),
        ('EXHORTATION', 'Exhortation'),
        ('GIVING', 'Giving'),
        ('ADMINISTRATION', 'Administration'),
        ('COMPASSION', 'Compassion'),
    ]

    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    associated_gift = models.CharField(
        max_length=20, 
        choices=GIFT_CHOICES,
        help_text="The motivational gift this book corresponds to"
    )
    slug = models.SlugField(unique=True)
    publication_info = models.JSONField(
        default=dict,
        help_text="Publication details including publisher, year, etc."
    )
    copyright_info = models.TextField()
    version = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} - {self.get_associated_gift_display()}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class CareerCategory(models.Model):
    """
    Categories within each book (e.g., 'Agriculture and Natural Resources')
    """
    book = models.ForeignKey(
        Book, 
        on_delete=models.CASCADE,
        related_name='categories'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    order = models.PositiveIntegerField(
        help_text="Order in which category appears in book"
    )
    slug = models.SlugField()

    class Meta:
        ordering = ['order']
        unique_together = [['book', 'order'], ['book', 'slug']]
        verbose_name_plural = 'Career Categories'

    def __str__(self):
        return f"{self.title} - {self.book.title}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class Career(models.Model):
    """Individual career entries within categories"""
    POSSIBILITY_RATINGS = [
        ('HP', 'Highly Possible'),
        ('VP', 'Very Possible'),
        ('P', 'Possible'),
    ]

    category = models.ForeignKey(
        CareerCategory, 
        on_delete=models.CASCADE,
        related_name='careers'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    possibility_rating = models.CharField(
        max_length=2,
        choices=POSSIBILITY_RATINGS
    )
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='specializations'
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category', 'order']
        verbose_name_plural = 'Careers'

    def __str__(self):
        return f"{self.title} ({self.get_possibility_rating_display()})"

class UserBookProgress(models.Model):
    """Tracks user's progress through books"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='book_progress'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    current_category = models.ForeignKey(
        CareerCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reading_users'
    )
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    started_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(auto_now=True)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = [['user', 'book']]

    def __str__(self):
        return f"{self.user.username}'s progress on {self.book.title}"

class CareerBookmark(models.Model):
    """User bookmarks for careers of interest"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='career_bookmarks'
    )
    career = models.ForeignKey(
        Career,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['user', 'career']]

    def __str__(self):
        return f"{self.user.username}'s bookmark: {self.career.title}"

class ReadingHistory(models.Model):
    """Tracks detailed reading history per category"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reading_history'
    )
    category = models.ForeignKey(
        CareerCategory,
        on_delete=models.CASCADE,
        related_name='reading_history'
    )
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    last_position = models.PositiveIntegerField(
        default=0,
        help_text="Last read position in category"
    )
    read_duration = models.DurationField(
        null=True,
        blank=True,
        help_text="Total time spent reading this category"
    )

    class Meta:
        unique_together = [['user', 'category']]
        verbose_name_plural = 'Reading Histories'

    def __str__(self):
        return f"{self.user.username}'s progress in {self.category.title}"

class BookAccess(models.Model):
    """Tracks which books users have access to based on their gifts"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='book_access'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='user_access'
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    access_reason = models.CharField(
        max_length=20,
        choices=[
            ('PRIMARY', 'Primary Gift'),
            ('SECONDARY', 'Secondary Gift'),
            ('PURCHASED', 'Purchased Access'),
        ]
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [['user', 'book']]
        verbose_name_plural = 'Book Access'

    def __str__(self):
        return f"{self.user.username}'s access to {self.book.title}"

    def is_valid(self):
        """Check if access is still valid"""
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            self.is_active = False
            self.save()
            return False
        return True

class CareerChoice(models.Model):
    """
    Tracks user's career choices and notes from the book's summary section
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='career_choices'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='user_career_choices'
    )
    # First career choice
    career_choice_1 = models.ForeignKey(
        Career,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_choices'
    )
    # Second career choice
    career_choice_2 = models.ForeignKey(
        Career,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='secondary_choices'
    )
    additional_notes = models.TextField(
        blank=True,
        help_text="Additional notes about career choices and research plans"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_final = models.BooleanField(
        default=False,
        help_text="Indicates if this is the user's final career goal selection"
    )

    class Meta:
        ordering = ['-updated_at']
        unique_together = [['user', 'book']]
        verbose_name = 'Career Choice'
        verbose_name_plural = 'Career Choices'

    def __str__(self):
        choices = []
        if self.career_choice_1:
            choices.append(self.career_choice_1.title)
        if self.career_choice_2:
            choices.append(self.career_choice_2.title)
        return f"{self.user.username}'s choices: {', '.join(choices)}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

class CareerResearchNote(models.Model):
    """
    Allows users to track their career research progress and notes
    """
    career_choice = models.ForeignKey(
        CareerChoice,
        on_delete=models.CASCADE,
        related_name='research_notes'
    )
    note_type = models.CharField(
        max_length=20,
        choices=[
            ('RESEARCH', 'Research Note'),
            ('QUESTION', 'Question to Ask'),
            ('REQUIREMENT', 'Career Requirement'),
            ('GOAL', 'Career Goal'),
            ('OTHER', 'Other Note')
        ]
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Career Research Note'
        verbose_name_plural = 'Career Research Notes'

    def __str__(self):
        return f"{self.career_choice.user.username}'s {self.get_note_type_display()}"
