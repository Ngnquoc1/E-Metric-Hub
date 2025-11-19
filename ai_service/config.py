"""
Configuration for ABSA Model Service
"""
import os
from pathlib import Path

# Project paths
BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / 'absa_phobert_model'

# Model configuration
MODEL_NAME = 'vinai/phobert-base'
MAX_LENGTH = 256
NUM_LABELS = 3

# Aspect columns matching training data
ASPECT_COLUMNS = [
    'Price',
    'Shipping', 
    'Outlook',
    'Quality',
    'Size',
    'Shop_Service',
    'General',
    'Others'
]

# Label mappings
LABEL_MAP = {-1: 0, 0: 1, 1: 2}
INV_LABEL_MAP = {0: -1, 1: 0, 2: 1}

LABEL_NAMES = {
    -1: 'positive',
    0: 'neutral',
    1: 'negative'
}

# Vietnamese aspect names for display
ASPECT_DISPLAY_NAMES = {
    'Price': 'Giá cả',
    'Shipping': 'Vận chuyển',
    'Outlook': 'Ngoại quan',
    'Quality': 'Chất lượng',
    'Size': 'Kích thước',
    'Shop_Service': 'Dịch vụ shop',
    'General': 'Tổng quan',
    'Others': 'Khác'
}

# Server configuration
API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', 8001))
WORKERS = int(os.getenv('WORKERS', 1))

# Device configuration
DEVICE = 'cuda' if os.getenv('USE_CUDA', 'false').lower() == 'true' else 'cpu'
