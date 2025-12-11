"""
Mother/Patient routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Mother, CallLog
from extensions import db
from datetime import datetime, date
from services.ivr_service import IVRService

mothers_bp = Blueprint('mothers', __name__)
ivr_service = IVRService()

@mothers_bp.route('', methods=['GET'])
@jwt_required()
def get_mothers():
    """Get all mothers assigned to current ASHA"""
    asha_id = get_jwt_identity()
    flagged = request.args.get('flagged', type=str)
    
    query = Mother.query.filter_by(asha_id=asha_id)
    
    if flagged == 'true':
        query = query.filter_by(flagged=True)
    elif flagged == 'false':
        query = query.filter_by(flagged=False)
    
    mothers = query.all()
    return jsonify([mother.to_dict() for mother in mothers]), 200

@mothers_bp.route('/<mother_id>', methods=['GET'])
@jwt_required()
def get_mother(mother_id):
    """Get specific mother details"""
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    return jsonify(mother.to_dict()), 200

@mothers_bp.route('', methods=['POST'])
@jwt_required()
def create_mother():
    """Create new mother record"""
    asha_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['name', 'age', 'phone', 'address', 'last_anc_date', 'gestation_weeks']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    try:
        last_anc_date = datetime.strptime(data['last_anc_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    mother = Mother(
        asha_id=asha_id,
        name=data['name'],
        age=data['age'],
        phone=data['phone'],
        address=data['address'],
        last_anc_date=last_anc_date,
        gestation_weeks=data['gestation_weeks'],
        health_status=data.get('health_status', 'normal'),
        next_appointment_date=datetime.strptime(data['next_appointment_date'], '%Y-%m-%d').date() if data.get('next_appointment_date') else None,
        last_period_date=datetime.strptime(data['last_period_date'], '%Y-%m-%d').date() if data.get('last_period_date') else None,
        cycle_length=data.get('cycle_length', 28),
        post_pregnancy=data.get('post_pregnancy', False)
    )
    
    db.session.add(mother)
    db.session.commit()
    
    return jsonify(mother.to_dict()), 201

@mothers_bp.route('/<mother_id>', methods=['PUT'])
@jwt_required()
def update_mother(mother_id):
    """Update mother record"""
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        mother.name = data['name']
    if 'age' in data:
        mother.age = data['age']
    if 'phone' in data:
        mother.phone = data['phone']
    if 'address' in data:
        mother.address = data['address']
    if 'last_anc_date' in data:
        mother.last_anc_date = datetime.strptime(data['last_anc_date'], '%Y-%m-%d').date()
    if 'gestation_weeks' in data:
        mother.gestation_weeks = data['gestation_weeks']
    if 'flagged' in data:
        mother.flagged = data['flagged']
    if 'visited' in data:
        mother.visited = data['visited']
    if 'notes' in data:
        mother.notes = data['notes']
    if 'health_status' in data:
        mother.health_status = data['health_status']
    if 'next_appointment_date' in data:
        mother.next_appointment_date = datetime.strptime(data['next_appointment_date'], '%Y-%m-%d').date() if data['next_appointment_date'] else None
    if 'medication_reminders' in data:
        mother.medication_reminders = data['medication_reminders']
    if 'last_period_date' in data:
        mother.last_period_date = datetime.strptime(data['last_period_date'], '%Y-%m-%d').date() if data['last_period_date'] else None
    if 'cycle_length' in data:
        mother.cycle_length = data['cycle_length']
    if 'post_pregnancy' in data:
        mother.post_pregnancy = data['post_pregnancy']
    
    db.session.commit()
    
    return jsonify(mother.to_dict()), 200

@mothers_bp.route('/<mother_id>/call-logs', methods=['GET'])
@jwt_required()
def get_mother_call_logs(mother_id):
    """Get call logs for a specific mother"""
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    call_logs = CallLog.query.filter_by(mother_id=mother_id).order_by(CallLog.created_at.desc()).all()
    return jsonify([log.to_dict() for log in call_logs]), 200

@mothers_bp.route('/flagged', methods=['GET'])
@jwt_required()
def get_flagged_mothers():
    """Get all flagged mothers"""
    asha_id = get_jwt_identity()
    mothers = Mother.query.filter_by(asha_id=asha_id, flagged=True).all()
    return jsonify([mother.to_dict() for mother in mothers]), 200

@mothers_bp.route('/<mother_id>/trigger-call', methods=['POST'])
@jwt_required()
def trigger_call(mother_id):
    """
    Trigger an IVR call to a mother when flagged in dashboard
    Used for demo purposes - ASHA can trigger a call to a custom number
    """
    asha_id = get_jwt_identity()
    mother = Mother.query.filter_by(id=mother_id, asha_id=asha_id).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    data = request.get_json() or {}
    call_type = data.get('call_type', 'demo_flag_alert')
    
    # Initiate the call via IVR service
    result = ivr_service.initiate_call(mother, call_type)
    
    if result.get('success'):
        # Log the call initiation
        call_log = CallLog(
            asha_id=asha_id,
            mother_id=mother_id,
            phone=mother.phone,
            result='initiated',
            call_sid=result.get('call_sid'),
            response_data=f"Call triggered from dashboard - Type: {call_type}"
        )
        db.session.add(call_log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Call initiated to {mother.name}',
            'call_sid': result.get('call_sid'),
            'provider': result.get('provider', 'twilio')
        }), 200
    else:
        return jsonify({
            'success': False,
            'error': result.get('error'),
            'details': result.get('details')
        }), 400


