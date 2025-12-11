"""
Database initialization script (Simple version)
Use setup.py for full initialization with all features
"""
from app import create_app
from extensions import db
from models import ASHA, Mother, PHCStock
from datetime import date, timedelta

def init_database():
    """Simple database initialization - creates basic sample data"""
    app = create_app()
    
    with app.app_context():
        print("🗄️  Initializing database...")
        
        # Drop all tables (for fresh start)
        db.drop_all()
        
        # Create all tables
        db.create_all()
        print("✅ Tables created")
        
        # Create sample ASHA worker
        asha = ASHA(
            asha_id='ASHA001',
            password='password123',
            name='Kamala Devi',
            phc_name='Thanjavur PHC',
            phone='+919876543210'
        )
        db.session.add(asha)
        db.session.commit()
        
        # Create PHC stock
        stock = PHCStock(
            asha_id=asha.id,
            iron_tablets=500,
            tt_vaccine=200
        )
        db.session.add(stock)
        
        # Create sample mothers
        mothers_data = [
            {
                'name': 'Anjali',
                'age': 24,
                'phone': '+919876543211',
                'address': 'Village 1, Thanjavur',
                'last_anc_date': date.today() - timedelta(days=14),
                'gestation_weeks': 24
            },
            {
                'name': 'Priya',
                'age': 28,
                'phone': '+919876543212',
                'address': 'Village 2, Thanjavur',
                'last_anc_date': date.today() - timedelta(days=7),
                'gestation_weeks': 18,
                'flagged': True
            }
        ]
        
        for data in mothers_data:
            flagged = data.pop('flagged', False)
            mother = Mother(asha_id=asha.id, **data)
            mother.flagged = flagged
            db.session.add(mother)
        
        db.session.commit()
        
        print("✅ Database initialized!")
        print(f"   ASHA ID: ASHA001")
        print(f"   Password: password123")

if __name__ == '__main__':
    init_database()

