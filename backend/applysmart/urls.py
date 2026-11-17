from django.http import JsonResponse
from django.urls import path

from accounts.api import SessionView
from applications.api import ApplicationRecordsView
from matching.api import (
    ComparisonsView,
    ComparisonResultView,
    RetryComparisonView,
)
from resumes.api import ResumeVersionsView


# Reports only that the process is up, so a database outage does not make the
# load balancer restart healthy backend tasks.
def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('api/health/', health),
    path('api/session/', SessionView.as_view()),
    path('api/applications/', ApplicationRecordsView.as_view()),
    path('api/resumes/', ResumeVersionsView.as_view()),

    path(
        'api/matching/comparisons/',
        ComparisonsView.as_view(),
    ),
    path(
        'api/matching/comparisons/<int:comparison_id>/',
        ComparisonResultView.as_view(),
    ),
    path(
        'api/matching/comparisons/<int:comparison_id>/retry/',
        RetryComparisonView.as_view(),
    ),
]