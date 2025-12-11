"""
Helper utility functions
"""
from datetime import datetime, date, timedelta

def calculate_next_period_date(last_period_date, cycle_length=28):
    """Calculate next expected period date"""
    if not last_period_date:
        return None
    return last_period_date + timedelta(days=cycle_length)

def calculate_gestation_weeks(last_anc_date):
    """Calculate current gestation weeks from last ANC date"""
    if not last_anc_date:
        return None
    days_passed = (date.today() - last_anc_date).days
    return days_passed // 7

def format_phone_number(phone):
    """Format phone number to standard format"""
    # Remove all non-digit characters
    digits = ''.join(filter(str.isdigit, phone))
    
    # Add country code if missing (assuming India +91)
    if len(digits) == 10:
        return f"+91{digits}"
    elif digits.startswith('91') and len(digits) == 12:
        return f"+{digits}"
    elif digits.startswith('+91'):
        return digits
    
    return phone

def validate_phone_number(phone):
    """Validate Indian phone number"""
    digits = ''.join(filter(str.isdigit, phone))
    # Indian mobile numbers are 10 digits
    return len(digits) == 10 or (len(digits) == 12 and digits.startswith('91'))

