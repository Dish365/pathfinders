from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

def health_check(request):
    return JsonResponse({"status": "healthy"})

@ensure_csrf_cookie
def serve_frontend(request, path=""):
    # Return 404 to let Next.js handle all frontend routes
    return JsonResponse({"error": "Not found"}, status=404)
