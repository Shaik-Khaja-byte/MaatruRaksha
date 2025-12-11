"""
IVR (Interactive Voice Response) routes
Handles Twilio/Exotel webhooks for voice calls
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Mother, CallLog, IVRSchedule
from extensions import db
from services.ivr_service import IVRService
from utils.helpers import format_phone_number
from datetime import datetime
import json

ivr_bp = Blueprint('ivr', __name__)
ivr_service = IVRService()

@ivr_bp.route('/webhook', methods=['POST'])
def ivr_webhook():
    """
    Webhook endpoint for IVR callbacks (Twilio/Exotel)
    This is called when:
    - Call is initiated
    - User responds (DTMF tones)
    - Call ends
    """
    data = request.form.to_dict() or request.get_json()
    
    # Extract call information
    call_sid = data.get('CallSid') or data.get('CallId')
    phone_number = data.get('From') or data.get('CallerNumber')
    call_status = data.get('CallStatus') or data.get('Status')
    digits = data.get('Digits') or data.get('DtmfDigits')  # User input
    
    if not phone_number:
        return jsonify({'error': 'Phone number not provided'}), 400
    
    # Normalize phone number using helper function
    normalized_phone = format_phone_number(phone_number)
    # Also try without country code for matching
    phone_digits = ''.join(filter(str.isdigit, phone_number))
    if len(phone_digits) == 12 and phone_digits.startswith('91'):
        phone_digits = phone_digits[2:]  # Remove country code
    
    # Find mother by phone number (try multiple formats)
    mother = Mother.query.filter_by(phone=phone_digits).first()
    if not mother:
        mother = Mother.query.filter_by(phone=normalized_phone).first()
    if not mother:
        mother = Mother.query.filter_by(phone=phone_number).first()
    if not mother:
        # Try with +91 prefix
        if not phone_digits.startswith('+91'):
            mother = Mother.query.filter_by(phone='+91' + phone_digits).first()
    
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    # Handle different call events
    if call_status == 'ringing' or call_status == 'initiated':
        # Call just started
        return ivr_service.handle_call_start(call_sid, mother)
    
    elif call_status == 'in-progress':
        # Call is active, handle user input
        if digits:
            return ivr_service.handle_user_input(call_sid, mother, digits)
        else:
            # Play initial message
            return ivr_service.play_initial_message(mother)
    
    elif call_status == 'completed' or call_status == 'ended':
        # Call ended, log it
        call_duration = data.get('CallDuration', 0)
        result = 'answered' if call_duration and int(call_duration) > 0 else 'not_answered'
        
        call_log = CallLog(
            asha_id=mother.asha_id,
            mother_id=mother.id,
            phone=phone_number,
            result=result,
            call_duration=int(call_duration) if call_duration else None,
            call_sid=call_sid,
            response_data=json.dumps(data)
        )
        db.session.add(call_log)
        
        # If not answered, flag the mother
        if result == 'not_answered':
            mother.flagged = True
        
        db.session.commit()
        
        return jsonify({'status': 'logged'}), 200
    
    return jsonify({'status': 'ok'}), 200

@ivr_bp.route('/initiate-call', methods=['POST'])
@jwt_required()
def initiate_call():
    """Manually initiate an IVR call to a mother"""
    data = request.get_json()
    mother_id = data.get('mother_id')
    call_type = data.get('call_type', 'reminder')
    
    mother = Mother.query.get(mother_id)
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    result = ivr_service.initiate_call(mother, call_type)
    
    if result.get('success'):
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@ivr_bp.route('/schedule-call', methods=['POST'])
@jwt_required()
def schedule_call():
    """Schedule an IVR call for later"""
    data = request.get_json()
    mother_id = data.get('mother_id')
    scheduled_time = data.get('scheduled_time')
    call_type = data.get('call_type', 'reminder')
    
    mother = Mother.query.get(mother_id)
    if not mother:
        return jsonify({'error': 'Mother not found'}), 404
    
    try:
        scheduled_datetime = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
    except:
        return jsonify({'error': 'Invalid date format'}), 400
    
    schedule = IVRSchedule(
        mother_id=mother_id,
        scheduled_time=scheduled_datetime,
        call_type=call_type,
        status='pending'
    )
    
    db.session.add(schedule)
    db.session.commit()
    
    return jsonify(schedule.to_dict()), 201

@ivr_bp.route('/call-logs', methods=['GET'])
@jwt_required()
def get_call_logs():
    """Get all call logs for current ASHA"""
    from flask_jwt_extended import get_jwt_identity
    asha_id = get_jwt_identity()
    
    call_logs = CallLog.query.filter_by(asha_id=asha_id).order_by(CallLog.created_at.desc()).limit(100).all()
    return jsonify([log.to_dict() for log in call_logs]), 200


