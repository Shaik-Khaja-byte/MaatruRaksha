"""
Route registration
"""
from routes.auth import auth_bp
from routes.mothers import mothers_bp
from routes.ashas import ashas_bp
from routes.ivr import ivr_bp
from routes.phc import phc_bp
from routes.health import health_bp
from routes.appointments import appointments_bp

def register_routes(app):
    """Register all blueprints"""
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(mothers_bp, url_prefix='/api/mothers')
    app.register_blueprint(ashas_bp, url_prefix='/api/ashas')
    app.register_blueprint(ivr_bp, url_prefix='/api/ivr')
    app.register_blueprint(phc_bp, url_prefix='/api/phc')
    app.register_blueprint(health_bp, url_prefix='/api/health')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')

