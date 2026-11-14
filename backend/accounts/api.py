from dataclasses import asdict

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services


class CredentialsSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


# DRF skips the CSRF check for anonymous requests, and sign-in is always anonymous,
# so the check is restored here. GET sets the cookie the page reads its token from.
@method_decorator([csrf_protect, ensure_csrf_cookie], name='dispatch')
class SessionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        student = services.current_student(request)
        if student is None:
            return Response({'detail': 'Not signed in.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(asdict(student))

    def post(self, request):
        credentials = CredentialsSerializer(data=request.data)
        credentials.is_valid(raise_exception=True)
        try:
            student = services.sign_in(request, **credentials.validated_data)
        except services.InvalidCredentialsError:
            return Response(
                {'detail': 'Username or password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(asdict(student))

    def delete(self, request):
        services.sign_out(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
