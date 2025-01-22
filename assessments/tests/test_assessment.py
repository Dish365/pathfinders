import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from assessments.models import Assessment, Question
from unittest.mock import patch, AsyncMock

User = get_user_model()

class AssessmentFlowTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test assessment with required user field
        self.assessment = Assessment.objects.create(
            title='Test Assessment',
            description='Test Description',
            user=self.user
        )
        
        # Create test questions
        self.questions = []
        for i in range(3):
            question = Question.objects.create(
                assessment=self.assessment,
                category=f'Category {i+1}',
                text=f'Question {i+1}',
                weight=1.0,
                gift_correlation={'TEACHING': 0.8, 'LEADERSHIP': 0.6},
                options=['Option 1', 'Option 2', 'Option 3']
            )
            self.questions.append(question)
            
        # Update URL patterns to use proper DRF naming
        self.start_url = reverse('assessment-start-assessment', kwargs={'pk': self.assessment.pk})
        self.submit_url = reverse('assessment-submit-answers', kwargs={'pk': self.assessment.pk})
        
    def test_get_questions(self):
        """Test retrieving questions for an assessment"""
        url = reverse('assessment-get-questions', kwargs={'pk': self.assessment.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # We created 3 questions
        
    @patch('assessments.views.FastAPIClient')
    def test_submit_answers(self, mock_client):
        # Setup mock FastAPI client
        mock_instance = mock_client.return_value
        mock_instance.calculate_gifts = AsyncMock(return_value={
            'primary_gift': 'Teaching',
            'secondary_gift': 'Leadership',
            'secondary_gifts': ['Leadership', 'Administration'],
            'scores': {
                'TEACHING': 0.8,
                'LEADERSHIP': 0.6,
                'ADMINISTRATION': 0.4
            }
        })
        
        # Submit answers
        answers = {
            str(self.questions[0].id): {'answer': 4, 'question_id': self.questions[0].id},
            str(self.questions[1].id): {'answer': 5, 'question_id': self.questions[1].id},
            str(self.questions[2].id): {'answer': 3, 'question_id': self.questions[2].id},
        }
        
        response = self.client.post(self.submit_url, {'answers': answers}, format='json')
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('primary_gift', response.data)
        self.assertIn('secondary_gift', response.data)
        self.assertEqual(response.data['primary_gift'], 'Teaching')
        self.assertEqual(response.data['secondary_gift'], 'Leadership')
        
        # Verify FastAPI client was called correctly
        mock_instance.calculate_gifts.assert_called_once()
        call_args = mock_instance.calculate_gifts.call_args[0][0]
        self.assertEqual(call_args['answers'], answers)

    def tearDown(self):
        # Clean up created objects
        User.objects.all().delete()
        Assessment.objects.all().delete()
        Question.objects.all().delete() 