"""
Appointment management routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Mother, Appointment
from extensions import db
from datetime import datetime, date, timedelta

appointments_bp = Blueprint('appointments', __name__)

@appointments_bp.route('', methods=['GET'])
@jwt_required()
def get_appointments():
    """Get appointments for current ASHA's mothers"""
    asha_id = get_jwt_identity()
    status = request.args.get('status')
    upcoming = request.args.get('upcoming', 'false')
    
    # Get all mothers for this ASHA
    mothers = Mother.query.filter_by(asha_id=asha_id).all()
    mother_ids = [m.id for m in mothers]
    
    query = Appointment.query.filter(Appointment.mother_id.in_(mother_ids))
    
    if status:
        query = query.filter_by(status=status)
    
    if upcoming == 'true':
        today = date.today()
        query = query.filter(Appointment.appointment_date >= today)
    
    appointments = query.order_by(Appointment.appointment_date.asc()).all()
    
    # Include mother details
    result = []
    for apt in appointments:
        apt_dict = apt.to_dict()
        mother = Mother.query.get(apt.mother_id)
        if mother:
            apt_dict['mother'] = mother.to_dict()
        result.append(apt_dict)
    
    return jsonify(result), 200

@appointments_bp.route('', methods=['POST'])
@jwt_required()
def create_appointment():
    """Create a new appointment"""
    asha_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['mother_id', 'appointment_date', 'appointment_type']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    mother = Mother.query.filter_by(id=data['mother_id'], asha_id=asha_id).first()
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    try:
        appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    appointment = Appointment(
        mother_id=data['mother_id'],
        appointment_date=appointment_date,
        appointment_type=data['appointment_type'],
        status=data.get('status', 'scheduled'),
        notes=data.get('notes')
    )
    
    db.session.add(appointment)
    
    # Update mother's next_appointment_date
    mother.next_appointment_date = appointment_date
    
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 201

@appointments_bp.route('/<appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update an appointment"""
    asha_id = get_jwt_identity()
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    
    # Verify ASHA has access to this mother
    mother = Mother.query.filter_by(id=appointment.mother_id, asha_id=asha_id).first()
    if not mother:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'appointment_date' in data:
        appointment.appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
    if 'appointment_type' in data:
        appointment.appointment_type = data['appointment_type']
    if 'status' in data:
        appointment.status = data['status']
    if 'reminder_sent' in data:
        appointment.reminder_sent = data['reminder_sent']
    if 'notes' in data:
        appointment.notes = data['notes']
    
    db.session.commit()
    
    return jsonify(appointment.to_dict()), 200

@appointments_bp.route('/upcoming', methods=['GET'])
@jwt_required()
def get_upcoming_appointments():
    """Get upcoming appointments (next 7 days)"""
    asha_id = get_jwt_identity()
    today = date.today()
    next_week = today + timedelta(days=7)
    
    mothers = Mother.query.filter_by(asha_id=asha_id).all()
    mother_ids = [m.id for m in mothers]
    
    appointments = Appointment.query.filter(
        Appointment.mother_id.in_(mother_ids),
        Appointment.appointment_date >= today,
        Appointment.appointment_date <= next_week,
        Appointment.status == 'scheduled'
    ).order_by(Appointment.appointment_date.asc()).all()
    
    result = []
    for apt in appointments:
        apt_dict = apt.to_dict()
        mother = Mother.query.get(apt.mother_id)
        if mother:
            apt_dict['mother'] = mother.to_dict()
        result.append(apt_dict)
    
    return jsonify(result), 200
