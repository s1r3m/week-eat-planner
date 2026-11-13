import os

APP_URL = os.getenv('APP_URL', 'http://localhost:81')
SMTP_HOST = os.getenv('SMTP_HOST', 'http://localhost')
MAIL_PORT = os.getenv('MAIL_PORT', '8025')
MAIL_URL = f'{SMTP_HOST}:{MAIL_PORT}'
PROXY_URL = os.environ.get('PROXY_URL', 'http://localhost:9000')
