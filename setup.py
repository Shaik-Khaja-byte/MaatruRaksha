"""
Setup script for Kannamma backend
Run this to initialize the database and create sample data
"""
import os
import sys
from app import create_app
from extensions import db
from models import ASHA, Mother, PHCStock, HealthRecord, Appointment
from datetime import date, timedelta, datetime

def setup_database():
    """Initialize database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        print("🗄️  Setting up database...")
        
        # Drop all tables (for fresh start)
        print("   Dropping existing tables...")
        db.drop_all()
        
        # Create all tables
        print("   Creating tables...")
        db.create_all()
        print("   ✅ Tables created successfully!")
        
        # Create sample ASHA worker
        print("\n👩‍⚕️  Creating sample ASHA worker...")
        asha = ASHA(
            asha_id='ASHA001',
            password='password123',  # In production, hash this
            name='Kamala Devi',
            phc_name='Thanjavur Primary Health Centre',
            phone='+919876543210',
            email='kamala.devi@kannamma.in'
        )
        db.session.add(asha)
        db.session.commit()
        print(f"   ✅ Created ASHA: {asha.name} (ID: {asha.asha_id})")
        
        # Create PHC stock for ASHA
        print("\n📦 Creating PHC stock...")
        stock = PHCStock(
            asha_id=asha.id,
            iron_tablets=500,
            tt_vaccine=200,
            folic_acid=300,
            calcium_tablets=400
        )
        db.session.add(stock)
        db.session.commit()
        print("   ✅ PHC stock created!")
        
        # Create sample mothers
        print("\n👩  Creating sample mothers...")
        mothers_data = [
            {
                'name': 'Anjali',
                'age': 24,
                'phone': '+919876543211',
                'address': 'Village 1, Thanjavur District, Tamil Nadu',
                'last_anc_date': date.today() - timedelta(days=14),
                'gestation_weeks': 24,
                'health_status': 'normal',
                'next_appointment_date': date.today() + timedelta(days=7),
                'medication_reminders': True
            },
            {
                'name': 'Priya',
                'age': 28,
                'phone': '+919876543212',
                'address': 'Village 2, Thanjavur District, Tamil Nadu',
                'last_anc_date': date.today() - timedelta(days=7),
                'gestation_weeks': 18,
                'health_status': 'pcos',
                'flagged': True,
                'next_appointment_date': date.today() + timedelta(days=3),
                'last_period_date': date.today() - timedelta(days=45),
                'cycle_length': 35
            },
            {
                'name': 'Meera',
                'age': 26,
                'phone': '+919876543213',
                'address': 'Village 3, Thanjavur District, Tamil Nadu',
                'last_anc_date': date.today() - timedelta(days=30),
                'gestation_weeks': 32,
                'health_status': 'normal',
                'next_appointment_date': date.today() + timedelta(days=14),
                'post_pregnancy': False
            },
            {
                'name': 'Lakshmi',
                'age': 22,
                'phone': '+919876543214',
                'address': 'Village 4, Thanjavur District, Tamil Nadu',
                'last_anc_date': date.today() - timedelta(days=60),
                'gestation_weeks': 0,
                'health_status': 'normal',
                'post_pregnancy': True,
                'next_appointment_date': date.today() + timedelta(days=10)
            }
        ]
        
        created_mothers = []
        for data in mothers_data:
            mother = Mother(
                asha_id=asha.id,
                **{k: v for k, v in data.items() if k != 'flagged'}
            )
            if 'flagged' in data:
                mother.flagged = data['flagged']
            db.session.add(mother)
            created_mothers.append(mother)
        
        db.session.commit()
        print(f"   ✅ Created {len(created_mothers)} sample mothers")
        
        # Create sample health records
        print("\n📋 Creating sample health records...")
        for mother in created_mothers:
            if mother.health_status == 'pcos':
                # Add period record for PCOS patient
                period_record = HealthRecord(
                    mother_id=mother.id,
                    record_type='period',
                    date=mother.last_period_date if mother.last_period_date else date.today() - timedelta(days=45),
                    notes='Irregular cycle - PCOS'
                )
                db.session.add(period_record)
            
            # Add medication record
            med_record = HealthRecord(
                mother_id=mother.id,
                record_type='medication',
                date=date.today() - timedelta(days=1),
                medication_taken=True,
                notes='Iron tablets taken'
            )
            db.session.add(med_record)
        
        db.session.commit()
        print("   ✅ Health records created!")
        
        # Create sample appointments
        print("\n📅 Creating sample appointments...")
        for mother in created_mothers:
            if mother.next_appointment_date:
                appointment = Appointment(
                    mother_id=mother.id,
                    appointment_date=mother.next_appointment_date,
                    appointment_type='anc',
                    status='scheduled',
                    reminder_sent=False
                )
                db.session.add(appointment)
        
        db.session.commit()
        print("   ✅ Appointments created!")
        
        print("\n" + "="*50)
        print("✅ Database setup completed successfully!")
        print("="*50)
        print("\n📝 Login Credentials:")
        print(f"   ASHA ID: ASHA001")
        print(f"   Password: password123")
        print(f"\n📊 Sample Data Created:")
        print(f"   - 1 ASHA worker")
        print(f"   - {len(created_mothers)} mothers")
        print(f"   - PHC stock inventory")
        print(f"   - Health records")
        print(f"   - Appointments")
        print("\n🚀 You can now start the Flask server:")
        print("   python app.py")
        print("="*50)

if __name__ == '__main__':
    try:
        setup_database()
    except Exception as e:
        print(f"\n❌ Error setting up database: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you've installed dependencies: pip install -r requirements.txt")
        print("2. Check your DATABASE_URL in .env file")
        print("3. For SQLite, ensure you have write permissions")
        print("4. For PostgreSQL, ensure the database exists and credentials are correct")
        sys.exit(1)

