from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView

# Create your views here.

def health_check(request):
    return JsonResponse({"status": "healthy"})

@ensure_csrf_cookie
def serve_frontend(request, path=''):
    """Serve the Next.js frontend"""
    return render(request, 'index.html')

class FrontendView(TemplateView):
    template_name = 'index.html'

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
