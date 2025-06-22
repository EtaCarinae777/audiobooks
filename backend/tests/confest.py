import pytest
import os
import django
from django.conf import settings

def pytest_configure(config):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.test_settings')
    django.setup()

@pytest.fixture(scope='session')
def django_db_setup():
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
