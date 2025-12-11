"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from models import ASHA
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """ASHA worker login"""
    data = request.get_json()
    asha_id = data.get('asha_id')
    password = data.get('password')
    
    if not asha_id or not password:
        return jsonify({'error': 'ASHA ID and password required'}), 400
    
    asha = ASHA.query.filter_by(asha_id=asha_id).first()
    
    if not asha:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # In production, use hashed passwords
    if asha.password != password:  # For demo, plain text comparison
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=asha.id)
    
    return jsonify({
        'access_token': access_token,
        'asha': asha.to_dict()
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new ASHA worker"""
    data = request.get_json()
    
    required_fields = ['asha_id', 'password', 'name', 'phc_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    if ASHA.query.filter_by(asha_id=data['asha_id']).first():
        return jsonify({'error': 'ASHA ID already exists'}), 400
    
    asha = ASHA(
        asha_id=data['asha_id'],
        password=data['password'],  # In production, hash this
        name=data['name'],
        phc_name=data['phc_name'],
        phone=data.get('phone'),
        email=data.get('email')
    )
    
    db.session.add(asha)
    db.session.commit()
    
    access_token = create_access_token(identity=asha.id)
    
    return jsonify({
        'access_token': access_token,
        'asha': asha.to_dict()
    }), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current logged-in ASHA worker"""
    asha_id = get_jwt_identity()
    asha = ASHA.query.get(asha_id)
    
    if not asha:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(asha.to_dict()), 200

