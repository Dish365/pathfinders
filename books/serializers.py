from rest_framework import serializers
from .models import Book, CareerCategory, Career, UserBookProgress, CareerBookmark, ReadingHistory, CareerChoice, CareerResearchNote

class BookSerializer(serializers.ModelSerializer):
    """Basic book information serializer"""
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'subtitle', 'associated_gift', 
            'slug', 'publication_info', 'version'
        ]

class CareerSerializer(serializers.ModelSerializer):
    """Career information serializer"""
    category_name = serializers.CharField(source='category.title', read_only=True)
    specializations = serializers.SerializerMethodField()
    
    class Meta:
        model = Career
        fields = [
            'id', 'title', 'description', 'possibility_rating',
            'category_name', 'order', 'parent', 'specializations'
        ]
    
    def get_specializations(self, obj):
        if obj.parent is None:  # Only get specializations for parent careers
            return [{
                'title': spec.title,
                'order': spec.order
            } for spec in obj.specializations.all().order_by('order')]
        return None

class CategorySerializer(serializers.ModelSerializer):
    """Category with nested careers serializer"""
    careers = CareerSerializer(many=True, read_only=True)
    
    class Meta:
        model = CareerCategory
        fields = [
            'id', 'title', 'description', 'order',
            'slug', 'careers'
        ]

class BookDetailSerializer(BookSerializer):
    """Detailed book information with categories"""
    categories = CategorySerializer(many=True, read_only=True)
    
    class Meta(BookSerializer.Meta):
        fields = BookSerializer.Meta.fields + [
            'copyright_info', 'created_at', 'updated_at',
            'categories'
        ]

class ReadingProgressSerializer(serializers.ModelSerializer):
    """User's reading progress serializer"""
    current_category_title = serializers.CharField(
        source='current_category.title',
        read_only=True
    )
    
    class Meta:
        model = UserBookProgress
        fields = [
            'id', 'current_category', 'current_category_title',
            'completion_percentage', 'started_at', 'last_accessed',
            'completed'
        ]
        read_only_fields = ['started_at']

class CareerBookmarkSerializer(serializers.ModelSerializer):
    """Career bookmark serializer"""
    career_title = serializers.CharField(source='career.title', read_only=True)
    category_title = serializers.CharField(
        source='career.category.title', 
        read_only=True
    )
    
    class Meta:
        model = CareerBookmark
        fields = [
            'id', 'career', 'career_title', 'category_title',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ReadingHistorySerializer(serializers.ModelSerializer):
    """Reading history serializer"""
    category_title = serializers.CharField(
        source='category.title',
        read_only=True
    )
    
    class Meta:
        model = ReadingHistory
        fields = [
            'id', 'category', 'category_title', 'completed',
            'completion_date', 'last_position', 'read_duration'
        ] 

class CareerResearchNoteSerializer(serializers.ModelSerializer):
    """Serializer for career research notes"""
    note_type_display = serializers.CharField(source='get_note_type_display', read_only=True)
    
    class Meta:
        model = CareerResearchNote
        fields = [
            'id', 'note_type', 'note_type_display', 'content',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class CareerChoiceSerializer(serializers.ModelSerializer):
    """Serializer for user's career choices"""
    career_choice_1 = CareerSerializer(read_only=True)
    career_choice_2 = CareerSerializer(read_only=True)
    research_notes = CareerResearchNoteSerializer(many=True, read_only=True)
    bookmarked_careers = serializers.SerializerMethodField()
    
    class Meta:
        model = CareerChoice
        fields = [
            'id', 'career_choice_1', 'career_choice_2', 
            'additional_notes', 'is_final', 'created_at', 
            'updated_at', 'research_notes', 'book', 'bookmarked_careers'
        ]
        read_only_fields = ['created_at', 'updated_at', 'research_notes']

    def get_bookmarked_careers(self, obj):
        bookmarks = CareerBookmark.objects.filter(
            user=obj.user,
            career__category__book=obj.book
        )
        return CareerBookmarkSerializer(bookmarks, many=True).data 