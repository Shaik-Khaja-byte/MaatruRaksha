"""
PHC (Primary Health Centre) stock routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import PHCStock
from extensions import db

phc_bp = Blueprint('phc', __name__)

@phc_bp.route('/stock', methods=['GET'])
@jwt_required()
def get_stock():
    """Get PHC stock for current ASHA"""
    asha_id = get_jwt_identity()
    stock = PHCStock.query.filter_by(asha_id=asha_id).first()
    
    if not stock:
        # Create default stock if doesn't exist
        stock = PHCStock(asha_id=asha_id)
        db.session.add(stock)
        db.session.commit()
    
    return jsonify(stock.to_dict()), 200

@phc_bp.route('/stock', methods=['PUT'])
@jwt_required()
def update_stock():
    """Update PHC stock"""
    asha_id = get_jwt_identity()
    data = request.get_json()
    
    stock = PHCStock.query.filter_by(asha_id=asha_id).first()
    
    if not stock:
        stock = PHCStock(asha_id=asha_id)
        db.session.add(stock)
    
    if 'iron_tablets' in data:
        stock.iron_tablets = data['iron_tablets']
    if 'tt_vaccine' in data:
        stock.tt_vaccine = data['tt_vaccine']
    if 'folic_acid' in data:
        stock.folic_acid = data['folic_acid']
    if 'calcium_tablets' in data:
        stock.calcium_tablets = data['calcium_tablets']
    
    db.session.commit()
    
    return jsonify(stock.to_dict()), 200


