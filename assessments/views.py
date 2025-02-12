from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Question, Assessment, GiftProfile
from .serializers import (
    QuestionSerializer, 
    AssessmentSerializer, 
    AssessmentProgressSerializer
)
from .gift_calculator import GiftCalculator
from django.utils import timezone
import asyncio
from core.services import FastAPIClient
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from books.services import BookAccessService

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return all active questions"""
        return Question.objects.all().order_by('id')

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        """Get all questions for assessment"""
        questions = self.get_queryset()
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    calculator = GiftCalculator()

    def get_queryset(self):
        return Assessment.objects.filter(user=self.request.user)

    @action(detail=True, methods=['get'])
    def get_questions(self, request, pk=None):
        """Get questions for a specific assessment"""
        assessment = self.get_object()
        questions = Question.objects.filter(assessment=assessment)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='start-assessment')
    def start_assessment(self, request, pk=None):
        assessment = self.get_object()
        # Add your start assessment logic here
        return Response({'status': 'assessment started'})

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """Submit assessment answers"""
        try:
            answers = request.data.get('answers', [])
            if not answers:
                return Response(
                    {'error': "No answers provided"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Format answers for FastAPI
            formatted_data = {
                'user_id': request.user.id,
                'answers': [
                    {
                        'question_id': answer['question_id'],
                        'answer': int(answer['answer']),
                        'gift_correlation': {
                            k.upper(): float(v)
                            for k, v in answer['gift_correlation'].items()
                        }
                    }
                    for answer in answers
                ]
            }

            # Calculate results using FastAPI client
            client = FastAPIClient()
            try:
                # Use synchronous request instead of async
                results = client.calculate_gifts_sync(formatted_data)
                
                # Create new assessment
                assessment = Assessment.objects.create(
                    user=request.user,
                    completion_status=True,
                    results_data=results
                )

                # Add debug logging before creating gift profile
                print(f"Debug - Results from FastAPI: {results}")
                print(f"Debug - Creating gift profile with primary: {results['primary_gift']}, secondary: {results['secondary_gifts']}")
                
                gift_profile = GiftProfile.objects.create(
                    user=request.user,
                    assessment=assessment,
                    primary_gift=results['primary_gift'],
                    secondary_gifts=results['secondary_gifts'],
                    scores=results['scores']
                )

                # Add debug logging before granting book access
                print(f"Debug - About to grant book access for user {request.user.id}")
                print(f"Debug - Gift Profile ID: {gift_profile.id}")
                BookAccessService.grant_gift_based_access(request.user, gift_profile)
                print("Debug - Book access granted")

                return Response(results, status=status.HTTP_200_OK)

            except ValueError as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'error': f"Calculation failed: {str(e)}"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            return Response(
                {'error': f"Submission failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def save_progress(self, request):
        """Save partial assessment progress"""
        try:
            assessment = Assessment.objects.get(
                user=request.user,
                completion_status=False
            )
            current_answers = request.data.get('current_answers', [])
            
            assessment.results_data = {
                'progress': current_answers,
                'last_updated': timezone.now().isoformat()
            }
            assessment.save()
            return Response({'status': 'progress saved'})
        except Assessment.DoesNotExist:
            return Response(
                {'error': 'No incomplete assessment found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def get_progress(self, request):
        """Retrieve partial assessment progress"""
        try:
            assessment = Assessment.objects.get(
                user=request.user,
                completion_status=False
            )
            progress = assessment.results_data.get('progress', [])
            return Response(progress)
        except Assessment.DoesNotExist:
            return Response([])

    @action(detail=False, methods=['get'], url_path='latest-results')
    def latest_results(self, request):
        """Get user's latest assessment results"""
        print("Debug: Accessing latest_results endpoint")
        try:
            latest_assessment = Assessment.objects.filter(
                user=request.user,
                completion_status=True
            ).latest('created_at')
            
            latest_profile = GiftProfile.objects.get(
                user=request.user,
                assessment=latest_assessment
            )

            print("Debug - Gift Scores:", latest_profile.scores)

            calculator = GiftCalculator()
            primary_gift, secondary_gifts = calculator.identify_gifts(
                latest_profile.scores, 
                threshold_factor=0.80
            )
            
            descriptions = calculator.get_gift_descriptions(
                primary_gift,
                secondary_gifts
            )

            # Get recommended roles
            roles = latest_profile.user.profile.get_recommended_roles()
            
            return Response({
                'scores': latest_profile.scores,
                'primary_gift': primary_gift,
                'secondary_gifts': secondary_gifts,
                'last_assessment': latest_assessment.created_at.isoformat(),
                'descriptions': descriptions or latest_assessment.results_data.get('descriptions', {}),
                'recommended_roles': roles
            })
        except (Assessment.DoesNotExist, GiftProfile.DoesNotExist) as e:
            print(f"Debug - Error in latest_results: {str(e)}")
            return Response(
                {'error': 'No completed assessments found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    async def submit_assessment(self, request, pk=None):
        assessment = self.get_object()
        client = FastAPIClient()
        
        try:
            results = await client.calculate_gifts(request.data)
            # Store results including recommended roles
            assessment.results_data = results
            assessment.save()
            
            # Create gift profile
            gift_profile = GiftProfile.objects.create(
                user=request.user,
                assessment=assessment,
                primary_gift=results['primary_gift'],
                secondary_gifts=results['secondary_gifts'],
                scores=results['scores']
            )
            
            # Grant book access based on identified gifts
            BookAccessService.grant_gift_based_access(request.user, gift_profile)
            
            return Response(results)
        finally:
            asyncio.run(client.close())
