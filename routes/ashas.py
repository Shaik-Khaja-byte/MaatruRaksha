"""
ASHA worker routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import ASHA, Mother, CallLog, PHCStock
from extensions import db
from datetime import datetime, timedelta, date

ashas_bp = Blueprint('ashas', __name__)

@ashas_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get dashboard statistics for ASHA worker"""
    asha_id = get_jwt_identity()
    asha = ASHA.query.get(asha_id)
    
    if not asha:
        return jsonify({'error': 'ASHA not found'}), 404
    
    # Get statistics
    total_mothers = Mother.query.filter_by(asha_id=asha_id).count()
    flagged_mothers = Mother.query.filter_by(asha_id=asha_id, flagged=True).count()
    
    # Recent call logs (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_calls = CallLog.query.filter(
        CallLog.asha_id == asha_id,
        CallLog.created_at >= seven_days_ago
    ).count()
    
    # Calls by result
    answered_calls = CallLog.query.filter_by(asha_id=asha_id, result='answered').count()
    not_answered_calls = CallLog.query.filter_by(asha_id=asha_id, result='not_answered').count()
    
    # Upcoming appointments (next 7 days)
    today = date.today()
    next_week = today + timedelta(days=7)
    upcoming_appointments = Mother.query.filter(
        Mother.asha_id == asha_id,
        Mother.next_appointment_date >= today,
        Mother.next_appointment_date <= next_week
    ).count()
    
    return jsonify({
        'total_mothers': total_mothers,
        'flagged_mothers': flagged_mothers,
        'recent_calls': recent_calls,
        'answered_calls': answered_calls,
        'not_answered_calls': not_answered_calls,
        'upcoming_appointments': upcoming_appointments
    }), 200

@ashas_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get detailed statistics"""
    asha_id = get_jwt_identity()
    
    stats = {
        'total_mothers': Mother.query.filter_by(asha_id=asha_id).count(),
        'flagged_mothers': Mother.query.filter_by(asha_id=asha_id, flagged=True).count(),
        'visited_mothers': Mother.query.filter_by(asha_id=asha_id, visited=True).count(),
        'pcos_mothers': Mother.query.filter_by(asha_id=asha_id, health_status='pcos').count(),
        'post_pregnancy_mothers': Mother.query.filter_by(asha_id=asha_id, post_pregnancy=True).count(),
    }
    
    return jsonify(stats), 200

