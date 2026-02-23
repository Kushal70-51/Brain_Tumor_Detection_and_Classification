"""
Configuration module for Brain Tumor Detection API.
This module centralizes all configuration settings.
"""

import os
from pathlib import Path

class Config:
    """Base configuration class."""
    
    # Flask Settings
    DEBUG = False
    TESTING = False
    JSON_SORT_KEYS = False
    
    # Server Settings
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 5000))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    
    # Model Configuration
    BASE_DIR = Path(__file__).parent
    MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "model" / "brain_tumor_cnn_model.h5"))
    
    # Image Processing Configuration
    IMG_SIZE = int(os.getenv("IMG_SIZE", 224))
    GRADCAM_LAYER_NAME = os.getenv("GRADCAM_LAYER_NAME", "conv2d_2")
    GRADCAM_ALPHA = float(os.getenv("GRADCAM_ALPHA", 0.4))
    
    # File Upload Configuration
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}
    MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10)) * 1024 * 1024  # Convert MB to bytes
    
    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # Class Labels
    CLASS_LABELS = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary']


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    MODEL_PATH = os.getenv("MODEL_PATH", "mock_model")


def get_config():
    """Get appropriate configuration based on environment."""
    env = os.getenv("FLASK_ENV", "development").lower()
    
    if env == "production":
        return ProductionConfig()
    elif env == "testing":
        return TestingConfig()
    else:
        return DevelopmentConfig()
