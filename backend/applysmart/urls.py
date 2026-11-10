from django.http import JsonResponse
from django.urls import path


# Reports only that the process is up, so a database outage does not make the
# load balancer restart healthy backend tasks.
def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('api/health/', health),
]
