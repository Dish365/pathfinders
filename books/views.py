from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book, BookAccess, Career, ReadingHistory, CareerChoice, CareerResearchNote, CareerBookmark
from .serializers import (
    BookSerializer, 
    BookDetailSerializer,
    CategorySerializer,
    CareerSerializer,
    ReadingProgressSerializer,
    ReadingHistorySerializer,
    CareerChoiceSerializer,
    CareerResearchNoteSerializer
)
from .services import BookAccessService
from datetime import timedelta
from django.utils import timezone
import pytz

class BookViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Only return books the user has access to"""
        return BookAccessService.get_accessible_books(self.request.user)

    @action(detail=False, methods=['get'])
    def my_library(self, request):
        """Get user's accessible books with reading progress"""
        book_access = BookAccess.objects.filter(
            user=request.user,
            is_active=True
        ).select_related('book')
        
        print(f"Debug - Found {book_access.count()} active book access records")
        
        books_data = []
        for access in book_access:
            if access.is_valid():
                print(f"Debug - Processing book: {access.book.title} ({access.book.associated_gift})")
                progress = request.user.book_progress.filter(book=access.book).first()
                book_data = BookDetailSerializer(access.book).data
                book_data.update({
                    'access_details': {
                        'granted_at': access.granted_at,
                        'access_reason': access.access_reason,
                        'expires_at': access.expires_at
                    },
                    'reading_progress': {
                        'completion_percentage': progress.completion_percentage if progress else 0,
                        'last_accessed': progress.last_accessed if progress else None,
                        'current_category': progress.current_category.title if progress and progress.current_category else None
                    }
                })
                books_data.append(book_data)
        
        return Response(books_data)

    @action(detail=True, methods=['get'])
    def table_of_contents(self, request, pk=None):
        """Get book's table of contents with categories and careers"""
        try:
            book = self.get_object()
            categories = book.categories.all().prefetch_related('careers').order_by('order')
            
            if not categories.exists():
                return Response({
                    'error': 'No content available for this book yet'
                }, status=status.HTTP_404_NOT_FOUND)
            
            return Response(CategorySerializer(categories, many=True).data)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def current_position(self, request, pk=None):
        """Get user's current reading position in the book"""
        try:
            book = self.get_object()
            progress = request.user.book_progress.filter(book=book).first()
            
            if not progress:
                return Response({
                    'current_category': None,
                    'completion_percentage': 0,
                    'last_position': None
                })
            
            return Response(ReadingProgressSerializer(progress).data)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def save_position(self, request, pk=None):
        """Save user's current reading position and update reading history"""
        try:
            book = self.get_object()
            category_id = request.data.get('current_category')
            category = get_object_or_404(book.categories, id=category_id)
            
            # Update or create reading progress
            progress = request.user.book_progress.get_or_create(book=book)[0]
            serializer = ReadingProgressSerializer(progress, data=request.data, partial=True)
            
            if serializer.is_valid():
                progress = serializer.save()
                
                # Update reading history
                history, created = ReadingHistory.objects.get_or_create(
                    user=request.user,
                    category=category
                )
                
                # Update read duration if provided
                if 'read_duration' in request.data:
                    new_duration = timedelta(seconds=int(request.data['read_duration']))
                    if history.read_duration:
                        history.read_duration += new_duration
                    else:
                        history.read_duration = new_duration
                
                # Update completion status
                if request.data.get('completed', False):
                    history.completed = True
                    history.completion_date = timezone.now()
                
                history.last_position = int(timezone.now().timestamp())
                history.save()
                
                return Response(serializer.data)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Error saving reading position: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def careers(self, request, pk=None):
        """Get all careers listed in the book"""
        book = self.get_object()
        careers = Career.objects.filter(
            category__book=book
        ).select_related('category')
        return Response(CareerSerializer(careers, many=True).data)

    @action(detail=True, methods=['post'])
    def bookmark_career(self, request, pk=None):
        """Bookmark a career for later reference"""
        try:
            book = self.get_object()
            career_id = request.data.get('career_id')
            career = get_object_or_404(Career, id=career_id, category__book=book)
            
            bookmark, created = CareerBookmark.objects.get_or_create(
                user=request.user,
                career=career,
                defaults={'notes': request.data.get('notes', '')}
            )
            
            if not created and 'notes' in request.data:
                bookmark.notes = request.data['notes']
                bookmark.save()
            
            return Response({
                'id': bookmark.id,
                'career_title': bookmark.career.title,
                'category_title': bookmark.career.category.title,
                'notes': bookmark.notes,
                'created_at': bookmark.created_at,
                'updated_at': bookmark.updated_at
            })
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def reading_history(self, request, pk=None):
        """Get user's reading history for this book"""
        try:
            book = self.get_object()
            history = ReadingHistory.objects.filter(
                user=request.user,
                category__book=book
            ).select_related('category')
            
            # Calculate total duration properly
            total_duration = sum(
                (h.read_duration.total_seconds() for h in history if h.read_duration), 
                0
            )
            # Convert to hours and minutes
            hours = int(total_duration // 3600)
            minutes = int((total_duration % 3600) // 60)
            duration_str = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"
            
            return Response({
                'total_duration': duration_str,
                'categories_completed': history.filter(completed=True).count(),
                'last_read': history.order_by('-last_position').first().last_position if history.exists() else None,
                'detailed_history': [{
                    'id': h.id,
                    'category_title': h.category.title,
                    'completed': h.completed,
                    'completion_date': h.completion_date,
                    'read_duration': f"{int(h.read_duration.total_seconds() // 60)}m" if h.read_duration else None
                } for h in history]
            })
        except Exception as e:
            print(f"Error fetching reading history: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def bookmarks(self, request, pk=None):
        """Get user's bookmarks for a specific book"""
        try:
            book = self.get_object()
            bookmarks = CareerBookmark.objects.filter(
                user=request.user,
                career__category__book=book
            ).select_related('career', 'career__category')
            
            data = [{
                'id': bookmark.id,
                'career_title': bookmark.career.title,
                'category_title': bookmark.career.category.title,
                'notes': bookmark.notes,
                'created_at': bookmark.created_at,
                'updated_at': bookmark.updated_at
            } for bookmark in bookmarks]
            
            return Response(data)
        except Exception as e:
            print(f"Error fetching bookmarks: {str(e)}")  # Add debug logging
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'], url_path='remove_bookmark/(?P<bookmark_id>[^/.]+)')
    def remove_bookmark(self, request, pk=None, bookmark_id=None):
        """Remove a career bookmark"""
        try:
            book = self.get_object()
            bookmark = get_object_or_404(
                CareerBookmark,
                id=bookmark_id,
                user=request.user,
                career__category__book=book
            )
            bookmark.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error removing bookmark: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get', 'post'])
    def career_choices(self, request, pk=None):
        """Get or create/update career choices for a book"""
        try:
            book = self.get_object()
            print("Processing career choices request")
            
            if request.method == 'GET':
                choice = CareerChoice.objects.filter(
                    user=request.user,
                    book=book
                ).first()
                
                if not choice:
                    return Response([])
                    
                serializer = CareerChoiceSerializer(choice)
                print("Returning career choice:", serializer.data)  # Debug log
                return Response(serializer.data)  # Return single object, not array
                
            # POST method
            print("Received career choice data:", request.data)
            
            if not request.data.get('career_choice_1'):
                return Response(
                    {'error': 'Primary career choice is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get existing choice or create new one
            choice = CareerChoice.objects.filter(
                user=request.user,
                book=book
            ).first()
            
            career_data = {
                **request.data,
                'book': book.id,
                'career_choice_1': request.data['career_choice_1'],
                'career_choice_2': request.data.get('career_choice_2')
            }
            
            serializer = CareerChoiceSerializer(
                instance=choice,  # Pass existing instance if it exists
                data=career_data
            )
            
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"Error handling career choices: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CareerChoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user's career choices"""
    serializer_class = CareerChoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CareerChoice.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a research note to a career choice"""
        career_choice = self.get_object()
        serializer = CareerResearchNoteSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(career_choice=career_choice)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_as_final(self, request, pk=None):
        """Mark a career choice as final"""
        career_choice = self.get_object()
        career_choice.is_final = True
        career_choice.save()
        
        # Set other choices as not final
        CareerChoice.objects.filter(
            user=request.user
        ).exclude(id=career_choice.id).update(is_final=False)
        
        return Response({'status': 'marked as final'})

class CareerResearchNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing career research notes"""
    serializer_class = CareerResearchNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CareerResearchNote.objects.filter(
            career_choice__user=self.request.user
        )

    def perform_create(self, serializer):
        career_choice = get_object_or_404(
            CareerChoice,
            id=self.request.data.get('career_choice'),
            user=self.request.user
        )
        serializer.save(career_choice=career_choice)
