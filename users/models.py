from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from .ministry_roles import MINISTRY_ROLE_MAPPINGS

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
            
        user = self.model(
            email=self.normalize_email(email),
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

    def get_assessment_history(self):
        """Get user's assessment history ordered by date"""
        return self.assessment_set.all().order_by('-timestamp')
    
    def get_latest_gift_profile(self):
        """Get user's most recent gift profile"""
        return self.giftprofile_set.order_by('-timestamp').first()
    
    def get_gift_progress(self):
        """Get user's gift development progress over time"""
        return self.giftprofile_set.order_by('timestamp').values(
            'timestamp', 
            'primary_gift',
            'scores'
        )
    
    def get_accessible_books(self):
        """Get books accessible to user based on their primary gift"""
        latest_profile = self.get_latest_gift_profile()
        if not latest_profile:
            return []
        
        # Get books for primary gift only
        from books.models import Book
        accessible_books = Book.objects.filter(
            associated_gift=latest_profile.primary_gift.upper()
        )
        
        return accessible_books

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"
    
    def get_gift_summary(self):
        """Get summary of user's spiritual gifts"""
        latest_profile = self.user.get_latest_gift_profile()
        if not latest_profile:
            return None
        return {
            'primary_gift': latest_profile.primary_gift,
            'secondary_gifts': latest_profile.secondary_gifts,
            'last_assessment': latest_profile.timestamp
        }
    
    def get_recommended_roles(self):
        """
        Get recommended ministry roles based on motivational gifts.
        Returns categorized ministry roles based on primary and secondary gifts.
        """
        latest_profile = self.user.get_latest_gift_profile()
        if not latest_profile:
            return {
                'primary_roles': [],
                'secondary_roles': [],
                'ministry_areas': []
            }
        
        primary_roles = []
        secondary_roles = []
        ministry_areas = set()  # Using set to avoid duplicates
        
        # Add roles from primary gift
        if latest_profile.primary_gift in MINISTRY_ROLE_MAPPINGS:
            mapping = MINISTRY_ROLE_MAPPINGS[latest_profile.primary_gift]
            primary_roles.extend(mapping['primary'])
            ministry_areas.update(mapping['secondary'])
        
        # Add roles from secondary gifts
        for gift in latest_profile.secondary_gifts:
            if gift in MINISTRY_ROLE_MAPPINGS:
                mapping = MINISTRY_ROLE_MAPPINGS[gift]
                # Add top 2 primary roles from each secondary gift
                secondary_roles.extend(mapping['primary'][:2])
                ministry_areas.update(mapping['secondary'])
        
        return {
            'primary_roles': list(dict.fromkeys(primary_roles)),  # Remove duplicates while preserving order
            'secondary_roles': list(dict.fromkeys(secondary_roles)),
            'ministry_areas': sorted(list(ministry_areas))  # Convert set to sorted list
        }
