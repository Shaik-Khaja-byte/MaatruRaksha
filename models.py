"""
Database models for Kannamma application
"""
from datetime import datetime, date
from extensions import db
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class ASHA(db.Model):
    """ASHA Worker model"""
    __tablename__ = 'ashas'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    asha_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)  # Should be hashed in production
    name = db.Column(db.String(100), nullable=False)
    phc_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    mothers = db.relationship('Mother', backref='asha', lazy=True, cascade='all, delete-orphan')
    phc_stock = db.relationship('PHCStock', backref='asha', uselist=False, cascade='all, delete-orphan')
    call_logs = db.relationship('CallLog', backref='asha', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'asha_id': self.asha_id,
            'name': self.name,
            'phc_name': self.phc_name,
            'phone': self.phone,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Mother(db.Model):
    """Mother/Patient model"""
    __tablename__ = 'mothers'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    asha_id = db.Column(db.String(36), db.ForeignKey('ashas.id'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(20), nullable=False, index=True)
    address = db.Column(db.Text, nullable=False)
    last_anc_date = db.Column(db.Date, nullable=False)
    gestation_weeks = db.Column(db.Integer, nullable=False)
    flagged = db.Column(db.Boolean, default=False, index=True)
    visited = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Health tracking fields
    health_status = db.Column(db.String(50), default='normal')  # normal, pcos, high_risk, etc.
    next_appointment_date = db.Column(db.Date)
    medication_reminders = db.Column(db.Boolean, default=True)
    last_period_date = db.Column(db.Date)  # For period tracking
    cycle_length = db.Column(db.Integer, default=28)  # Average cycle length
    post_pregnancy = db.Column(db.Boolean, default=False)  # Post-pregnancy care
    
    # Relationships
    call_logs = db.relationship('CallLog', backref='mother', lazy=True, cascade='all, delete-orphan')
    health_records = db.relationship('HealthRecord', backref='mother', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='mother', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'asha_id': self.asha_id,
            'name': self.name,
            'age': self.age,
            'phone': self.phone,
            'address': self.address,
            'last_anc_date': self.last_anc_date.isoformat() if self.last_anc_date else None,
            'gestation_weeks': self.gestation_weeks,
            'flagged': self.flagged,
            'visited': self.visited,
            'notes': self.notes,
            'health_status': self.health_status,
            'next_appointment_date': self.next_appointment_date.isoformat() if self.next_appointment_date else None,
            'medication_reminders': self.medication_reminders,
            'last_period_date': self.last_period_date.isoformat() if self.last_period_date else None,
            'cycle_length': self.cycle_length,
            'post_pregnancy': self.post_pregnancy,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PHCStock(db.Model):
    """PHC Stock inventory model"""
    __tablename__ = 'phc_stock'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    asha_id = db.Column(db.String(36), db.ForeignKey('ashas.id'), unique=True, nullable=False)
    iron_tablets = db.Column(db.Integer, default=0)
    tt_vaccine = db.Column(db.Integer, default=0)
    folic_acid = db.Column(db.Integer, default=0)
    calcium_tablets = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'asha_id': self.asha_id,
            'iron_tablets': self.iron_tablets,
            'tt_vaccine': self.tt_vaccine,
            'folic_acid': self.folic_acid,
            'calcium_tablets': self.calcium_tablets,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CallLog(db.Model):
    """Call log model for IVR calls"""
    __tablename__ = 'call_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    asha_id = db.Column(db.String(36), db.ForeignKey('ashas.id'), nullable=False, index=True)
    mother_id = db.Column(db.String(36), db.ForeignKey('mothers.id'), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    result = db.Column(db.String(50), nullable=False)  # 'answered', 'not_answered', 'pressed_2', 'busy', 'failed'
    call_duration = db.Column(db.Integer)  # Duration in seconds
    call_sid = db.Column(db.String(100))  # Twilio/Exotel call ID
    response_data = db.Column(db.Text)  # JSON response data
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'asha_id': self.asha_id,
            'mother_id': self.mother_id,
            'phone': self.phone,
            'result': self.result,
            'call_duration': self.call_duration,
            'call_sid': self.call_sid,
            'response_data': self.response_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class HealthRecord(db.Model):
    """Health records for mothers (periods, symptoms, etc.)"""
    __tablename__ = 'health_records'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    mother_id = db.Column(db.String(36), db.ForeignKey('mothers.id'), nullable=False, index=True)
    record_type = db.Column(db.String(50), nullable=False)  # 'period', 'symptom', 'medication', 'appointment'
    date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)
    symptoms = db.Column(db.Text)  # JSON array of symptoms
    medication_taken = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'mother_id': self.mother_id,
            'record_type': self.record_type,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
            'symptoms': self.symptoms,
            'medication_taken': self.medication_taken,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Appointment(db.Model):
    """Appointment tracking"""
    __tablename__ = 'appointments'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    mother_id = db.Column(db.String(36), db.ForeignKey('mothers.id'), nullable=False, index=True)
    appointment_date = db.Column(db.Date, nullable=False, index=True)
    appointment_type = db.Column(db.String(50))  # 'anc', 'vaccination', 'checkup', 'ultrasound'
    status = db.Column(db.String(50), default='scheduled')  # 'scheduled', 'completed', 'missed', 'cancelled'
    reminder_sent = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'mother_id': self.mother_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_type': self.appointment_type,
            'status': self.status,
            'reminder_sent': self.reminder_sent,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class IVRSchedule(db.Model):
    """IVR call scheduling"""
    __tablename__ = 'ivr_schedules'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    mother_id = db.Column(db.String(36), db.ForeignKey('mothers.id'), nullable=False, index=True)
    scheduled_time = db.Column(db.DateTime, nullable=False, index=True)
    call_type = db.Column(db.String(50))  # 'reminder', 'checkup', 'medication', 'appointment'
    status = db.Column(db.String(50), default='pending')  # 'pending', 'completed', 'failed', 'cancelled'
    call_sid = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'mother_id': self.mother_id,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'call_type': self.call_type,
            'status': self.status,
            'call_sid': self.call_sid,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

