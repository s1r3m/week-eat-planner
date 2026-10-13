import os

APP_HOST = os.environ.get('APP_HOST', 'localhost:8000')
APP_URL = os.environ.get('APP_URL', f'http://{APP_HOST}')
