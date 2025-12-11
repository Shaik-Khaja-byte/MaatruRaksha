"""
Configuration settings for Flask application
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///kannamma.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get('FLASK_ENV') == 'development'
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 86400))
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('FRONTEND_URL', 'http://localhost:5173').split(',')
    
    # Twilio Configuration
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
    
    # Exotel Configuration (Alternative)
    EXOTEL_API_KEY = os.environ.get('EXOTEL_API_KEY')
    EXOTEL_API_TOKEN = os.environ.get('EXOTEL_API_TOKEN')
    EXOTEL_SUBDOMAIN = os.environ.get('EXOTEL_SUBDOMAIN')
    
    # IVR Configuration
    IVR_CALLBACK_BASE_URL = os.environ.get('IVR_CALLBACK_BASE_URL', 'http://localhost:5000')

