from rest_framework import serializers
from .models import Question, Assessment, GiftProfile

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'category', 'text', 'weight', 'gift_correlation')

class GiftProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftProfile
        fields = ('id', 'user', 'assessment', 'primary_gift', 
                 'secondary_gifts', 'scores', 'timestamp')

class AssessmentSerializer(serializers.ModelSerializer):
    gift_profile = GiftProfileSerializer(read_only=True)
    can_retake = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Assessment
        fields = ('id', 'user', 'timestamp', 'completion_status', 
                 'results_data', 'gift_profile', 'can_retake')

class AssessmentProgressSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    primary_gift = serializers.CharField()
    scores = serializers.DictField() 