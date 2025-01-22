from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from assessments.models import Assessment, Question

User = get_user_model()

class ProgressTrackingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test assessment
        self.assessment = Assessment.objects.create(
            title='Test Assessment',
            description='Test Description',
            user=self.user
        )
        
        self.save_progress_url = reverse('assessment-save-progress')
        self.get_progress_url = reverse('assessment-get-progress')

    def test_save_and_retrieve_progress(self):
        progress_data = {
            'current_answers': [
                {'question_id': 1, 'answer': 4},
                {'question_id': 2, 'answer': 5}
            ]
        }

        # Save progress
        response = self.client.post(self.save_progress_url, progress_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Retrieve progress
        response = self.client.get(self.get_progress_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Two answers saved

    def tearDown(self):
        # Clean up created objects
        User.objects.all().delete()
        Assessment.objects.all().delete() 