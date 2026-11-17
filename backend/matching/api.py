from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts import services as accounts

from . import services


class CreateComparisonSerializer(serializers.Serializer):
    resumeId = serializers.CharField(allow_blank=True)
    jobPostingId = serializers.CharField(allow_blank=True)
    simulateFailure = serializers.BooleanField(default=False)


def comparison_to_json(result):
    return {
        'id': result.id,
        'resumeId': result.resume_id,
        'jobPostingId': result.job_posting_id,
        'status': result.status.value,
        'matchedQualifications': [
            {
                'qualification': {
                    'id': match.qualification.id,
                    'title': match.qualification.title,
                    'priority': match.qualification.priority.value,
                    'jobEvidence': match.qualification.job_evidence,
                },
                'resumeEvidence': match.resume_evidence,
            }
            for match in result.matched_qualifications
        ],
        'qualificationGaps': [
            {
                'qualification': {
                    'id': gap.qualification.id,
                    'title': gap.qualification.title,
                    'priority': gap.qualification.priority.value,
                    'jobEvidence': gap.qualification.job_evidence,
                },
                'reason': gap.reason,
            }
            for gap in result.qualification_gaps
        ],
        'failureReason': result.failure_reason,
    }


class ComparisonsView(APIView):
    def post(self, request):
        serializer = CreateComparisonSerializer(data=request.data)

        if not serializer.is_valid():
            first_messages = {
                field: messages[0]
                for field, messages in serializer.errors.items()
            }
            return Response(
                first_messages,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = services.create_comparison(
                student=accounts.current_student(request),
                resume_id=serializer.validated_data['resumeId'],
                job_posting_id=serializer.validated_data['jobPostingId'],
                simulate_failure=serializer.validated_data['simulateFailure'],
            )
        except services.ComparisonValidationError as error:
            return Response(
                error.field_errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            comparison_to_json(result),
            status=status.HTTP_202_ACCEPTED,
        )


class ComparisonResultView(APIView):
    def get(self, request, comparison_id):
        try:
            result = services.get_comparison_result(
                accounts.current_student(request),
                comparison_id,
            )
        except services.ComparisonNotFoundError:
            return Response(
                {'detail': 'Comparison not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(comparison_to_json(result))


class RetryComparisonView(APIView):
    def post(self, request, comparison_id):
        try:
            result = services.retry_comparison(
                accounts.current_student(request),
                comparison_id,
            )
        except services.ComparisonNotFoundError:
            return Response(
                {'detail': 'Comparison not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            comparison_to_json(result),
            status=status.HTTP_202_ACCEPTED,
        )