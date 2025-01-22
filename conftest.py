import os
import django
from django.conf import settings

# Configure Django settings for pytest
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pathfinders_project.settings')
django.setup()

# Add pytest markers
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    ) 