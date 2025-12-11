"""
Health tracking routes (periods, PCOS, post-pregnancy, etc.)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Mother, HealthRecord
from extensions import db
from datetime import datetime, date, timedelta

health_bp = Blueprint('health', __name__)

@health_bp.route('/records/<mother_id>', methods=['GET'])
@jwt_required()
def get_health_records(mother_id):
    """Get health records for a mother"""
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    record_type = request.args.get('type')
    query = HealthRecord.query.filter_by(mother_id=mother_id)
    
    if record_type:
        query = query.filter_by(record_type=record_type)
    
    records = query.order_by(HealthRecord.date.desc()).all()
    return jsonify([record.to_dict() for record in records]), 200

@health_bp.route('/records', methods=['POST'])
@jwt_required()
def create_health_record():
    """Create a new health record"""
    asha_id = get_jwt_identity()
    data = request.get_json()
    
    mother_id = data.get('mother_id')
    if not mother_id:
        return jsonify({'error': 'mother_id is required'}), 400
    
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    required_fields = ['record_type', 'date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        record_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    record = HealthRecord(
        mother_id=mother_id,
        record_type=data['record_type'],
        date=record_date,
        notes=data.get('notes'),
        symptoms=data.get('symptoms'),
        medication_taken=data.get('medication_taken', False)
    )
    
    db.session.add(record)
    
    # Update mother's last_period_date if it's a period record
    if data['record_type'] == 'period':
        mother.last_period_date = record_date
    
    db.session.commit()
    
    return jsonify(record.to_dict()), 201

@health_bp.route('/period-tracker/<mother_id>', methods=['GET'])
@jwt_required()
def get_period_tracker(mother_id):
    """Get period tracking information"""
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    # Get period records
    period_records = HealthRecord.query.filter_by(
        mother_id=mother_id,
        record_type='period'
    ).order_by(HealthRecord.date.desc()).limit(12).all()
    
    # Calculate next period date
    next_period_date = None
    if mother.last_period_date and mother.cycle_length:
        next_period_date = mother.last_period_date + timedelta(days=mother.cycle_length)
    
    return jsonify({
        'last_period_date': mother.last_period_date.isoformat() if mother.last_period_date else None,
        'cycle_length': mother.cycle_length,
        'next_period_date': next_period_date.isoformat() if next_period_date else None,
        'period_records': [record.to_dict() for record in period_records]
    }), 200

@health_bp.route('/pcos/<mother_id>', methods=['GET'])
@jwt_required()
def get_pcos_info(mother_id):
    """Get PCOS-related information for a mother"""
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    if mother.health_status != 'pcos':
        return jsonify({'error': 'Mother does not have PCOS status'}), 400
    
    # Get PCOS-related records
    pcos_records = HealthRecord.query.filter_by(
        mother_id=mother_id,
        record_type='symptom'
    ).order_by(HealthRecord.date.desc()).all()
    
    return jsonify({
        'mother': mother.to_dict(),
        'pcos_records': [record.to_dict() for record in pcos_records],
        'recommendations': [
            'Regular exercise and weight management',
            'Balanced diet with low glycemic index foods',
            'Regular monitoring of blood sugar levels',
            'Follow-up with gynecologist every 3 months'
        ]
    }), 200

@health_bp.route('/post-pregnancy/<mother_id>', methods=['GET'])
@jwt_required()
def get_post_pregnancy_info(mother_id):
    """Get post-pregnancy care information"""
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    if not mother.post_pregnancy:
        return jsonify({'error': 'Mother is not in post-pregnancy phase'}), 400
    
    # Get post-pregnancy records
    post_preg_records = HealthRecord.query.filter_by(
        mother_id=mother_id,
        record_type='appointment'
    ).order_by(HealthRecord.date.desc()).all()
    
    return jsonify({
        'mother': mother.to_dict(),
        'post_pregnancy_records': [record.to_dict() for record in post_preg_records],
        'care_checklist': [
            'Postnatal checkup within 6 weeks',
            'Contraception counseling',
            'Mental health screening',
            'Nutrition and breastfeeding support',
            'Family planning information'
        ]
    }), 200
