from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts import services as accounts
from . import services


class RecommendationPreferencesSerializer(serializers.Serializer):
    
    #  Frontend uses camelCase while the domain uses snake_case
    jobTypes = serializers.ListField(
        source='job_types',
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    locations = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    industries = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    experienceLevels = serializers.ListField(
        source='experience_levels',
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    @staticmethod
    def to_json(preferences):
        return {
            'jobTypes': preferences.job_types,
            'locations': preferences.locations,
            'industries': preferences.industries,
            'experienceLevels': preferences.experience_levels,
        }


class RecommendationPreferencesView(APIView):
    def get(self, request):
        student = accounts.current_student(request)
        preferences = services.get_preferences(student.id)

        return Response(
            RecommendationPreferencesSerializer.to_json(preferences)
        )
    def post(self, request):
        serializer = RecommendationPreferencesSerializer(data=request.data)

        if not serializer.is_valid():
            first_messages = {
                field: messages[0]
                for field, messages in serializer.errors.items()
            }
            return Response(
                first_messages,
                status=status.HTTP_400_BAD_REQUEST,
            )
        student = accounts.current_student(request)
        preferences = services.save_preferences(
            student_id=student.id,
            **serializer.validated_data,
        )
        return Response(
            RecommendationPreferencesSerializer.to_json(preferences),
            status=status.HTTP_200_OK,
        )