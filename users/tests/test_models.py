from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import Profile

User = get_user_model()

class UserModelTests(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_user_creation(self):
        self.assertEqual(self.user.username, self.user_data['username'])
        self.assertEqual(self.user.email, self.user_data['email'])
        self.assertTrue(self.user.check_password(self.user_data['password']))

    def test_profile_creation(self):
        """Test that a profile is automatically created for new users"""
        self.assertIsNotNone(self.user.profile)
        self.assertIsInstance(self.user.profile, Profile)

    def test_profile_str_representation(self):
        expected_str = f"{self.user.username}'s profile"
        self.assertEqual(str(self.user.profile), expected_str)

    def test_user_assessment_relationship(self):
        """Test that users can have multiple assessments"""
        from assessments.models import Assessment
        
        assessment1 = Assessment.objects.create(user=self.user)
        assessment2 = Assessment.objects.create(user=self.user)
        
        self.assertEqual(self.user.assessment_set.count(), 2)
        self.assertIn(assessment1, self.user.assessment_set.all())
        self.assertIn(assessment2, self.user.assessment_set.all()) 