"""
Local development settings for Pathfinders project.
This file is for local development and should not be committed to version control.
"""

# Set the environment to development
ENVIRONMENT = 'development'

# Debug settings
DEBUG = True

# Database settings - Use SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
    }
}

# CORS and CSRF settings for local development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Disable SSL and security features in development
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# Cookie settings for development
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_DOMAIN = None
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_DOMAIN = None

# Cache settings
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# FastAPI settings
FASTAPI_URL = 'http://127.0.0.1:8001'
FASTAPI_SETTINGS = {
    'HOST': 'http://127.0.0.1:8001',
    'ENDPOINTS': {
        'CALCULATE_GIFTS': '/calculate-gifts/',
        'SAVE_PROGRESS': '/progress/save/',
        'GET_PROGRESS': '/progress/{user_id}/'
    }
}

# Disable AWS S3 in development
AWS_ACCESS_KEY_ID = None
AWS_SECRET_ACCESS_KEY = None
AWS_STORAGE_BUCKET_NAME = None
AWS_S3_REGION_NAME = None
AWS_DEFAULT_ACL = None
AWS_S3_CUSTOM_DOMAIN = None

# Email settings - Console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging - More verbose for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
} 