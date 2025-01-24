from django.contrib.auth import get_user_model
from assessments.models import Question, Assessment, GiftProfile
from typing import Dict, Any

User = get_user_model()

def create_test_user(username: str = "testuser") -> User:
    """Create a test user"""
    return User.objects.create_user(
        username=username,
        email=f"{username}@test.com",
        password="testpass123"
    )

def create_test_questions() -> Dict[str, Question]:
    """Create test questions for each gift category"""
    questions = {}
    categories = ['Teaching', 'Leadership', 'Administration', 
                 'Evangelism', 'Shepherding', 'Mercy', 'Serving']
    
    for category in categories:
        question = Question.objects.create(
            category=category,
            text=f"Test question for {category}",
            weight=1.0,
            gift_correlation={
                category.upper(): 0.9,
                'LEADERSHIP': 0.3,
                'TEACHING': 0.2
            }
        )
        questions[category] = question
    
    return questions

def create_test_assessment(user: User, completed: bool = False) -> Assessment:
    """Create a test assessment"""
    assessment = Assessment.objects.create(
        user=user,
        completion_status=completed
    )
    
    if completed:
        assessment.results_data = {
            'scores': {'TEACHING': 0.8, 'LEADERSHIP': 0.6},
            'primary_gift': 'Teaching',
            'secondary_gifts': ['Leadership']
        }
        assessment.save()
        
        GiftProfile.objects.create(
            user=user,
            assessment=assessment,
            primary_gift='Teaching',
            secondary_gifts=['Leadership'],
            scores={'TEACHING': 0.8, 'LEADERSHIP': 0.6}
        )
    
    return assessment 