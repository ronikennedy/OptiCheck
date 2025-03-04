import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask settings
DEBUG = os.getenv('DEBUG', 'True') == 'True'
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 5000))
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')

# Frontend URL for CORS
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Google Sheets settings
SHEET_ID = os.getenv('SHEET_ID', '')
CREDENTIALS_FILE = os.getenv('GOOGLE_CREDENTIALS_FILE', 'credentials.json')

# Nuralogix API settings
NURALOGIX_API_KEY = os.getenv('NURALOGIX_API_KEY', '')
NURALOGIX_BASE_URL = os.getenv('NURALOGIX_BASE_URL', '')