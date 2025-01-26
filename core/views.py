from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

def health_check(request):
    return JsonResponse({"status": "healthy"})

@ensure_csrf_cookie
def serve_frontend(request, path=""):
    if request.path.startswith('/api/'):
        return JsonResponse({"error": "API endpoint not found"}, status=404)
    # Return 200 to let Next.js handle frontend routes
    return JsonResponse({"status": "ok"})
