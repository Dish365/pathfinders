"""
ASGI config for pathfinders_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pathfinders_project.settings')

# Initialize Django ASGI application
django_application = get_asgi_application()

# Initialize FastAPI application
fastapi_application = FastAPI()

# Add CORS middleware
fastapi_application.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pathfindersgifts.com",
        "https://www.pathfindersgifts.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Combined application
async def application(scope, receive, send):
    if scope["type"] == "http":
        path = scope["path"]
        if path.startswith("/api/fastapi/"):
            return await fastapi_application(scope, receive, send)
        return await django_application(scope, receive, send)
    return await django_application(scope, receive, send)
