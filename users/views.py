from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from .models import User, Profile
from .serializers import UserSerializer, ProfileSerializer, RegisterSerializer
from assessments.serializers import AssessmentProgressSerializer
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        token = get_token(request)
        response = Response({'csrfToken': token})
        response['X-CSRFToken'] = token
        return response

@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            csrf_token = get_token(request)
            response = Response({
                'user': UserSerializer(user).data,
                'token': csrf_token
            })
            # Ensure session cookie is set properly
            response.set_cookie(
                'sessionid',
                request.session.session_key,
                samesite='Lax',
                secure=False,  # Set to True in production
                httponly=True
            )
            return response
        
        return Response(
            {'message': 'Invalid credentials'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Ensure CSRF token is present in the response
            get_token(request)
            
            if request.user.is_authenticated:
                logout(request)
                return Response({'message': 'Successfully logged out'})
            else:
                return Response(
                    {'error': 'Not authenticated'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own profile unless they're staff
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        if self.action == 'register':
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Successfully logged out'})

    @action(detail=True, methods=['get'])
    def gift_progress(self, request, pk=None):
        user = self.get_object()
        progress_data = user.get_gift_progress()
        serializer = AssessmentProgressSerializer(progress_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'patch'])
    def profile(self, request):
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        
        # PATCH request
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_profile(self, request, pk=None):
        user = self.get_object()
        profile = user.profile
        
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
            return Response(UserSerializer(user).data)
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    @method_decorator(ensure_csrf_cookie)
    def me(self, request):
        """Get the current authenticated user's data"""
        # Add debug logging
        print("Session auth:", request.user.is_authenticated)
        print("Session ID:", request.session.session_key)
        
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication credentials were not provided.'}, 
                status=status.HTTP_401_UNAUTHORIZED  # Changed from 403 to 401
            )
        
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)

    @action(detail=True, methods=['get'])
    def recommended_roles(self, request, pk=None):
        profile = self.get_object()
        roles = profile.get_recommended_roles()
        return Response({'roles': roles})
