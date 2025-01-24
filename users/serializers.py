from rest_framework import serializers
from .models import User, Profile

class GiftSummarySerializer(serializers.Serializer):
    primary_gift = serializers.CharField()
    secondary_gifts = serializers.ListField(child=serializers.CharField())
    last_assessment = serializers.DateTimeField()

class ProfileSerializer(serializers.ModelSerializer):
    gift_summary = GiftSummarySerializer(source='get_gift_summary', read_only=True)
    recommended_roles = serializers.ListField(source='get_recommended_roles', read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio', 'birth_date', 'gift_summary', 'recommended_roles')

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    assessment_count = serializers.SerializerMethodField()
    latest_assessment = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'created_at', 'profile', 'assessment_count', 'latest_assessment')
        
    def get_assessment_count(self, obj):
        return obj.assessment_set.count()
        
    def get_latest_assessment(self, obj):
        latest = obj.assessment_set.order_by('-timestamp').first()
        if latest:
            return {
                'id': latest.id,
                'timestamp': latest.timestamp,
                'is_complete': latest.is_complete()
            }
        return None 

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        return data 