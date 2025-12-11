# Kannamma Backend API

Flask backend for Kannamma - Maternal Health Voice Guardian System

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Initialize database:**
```bash
python app.py
# This will create the database tables automatically
```

4. **Run the server:**
```bash
python app.py
# Server runs on http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new ASHA worker
- `POST /api/auth/login` - ASHA worker login
- `GET /api/auth/me` - Get current user (requires JWT)

### Mothers
- `GET /api/mothers` - Get all mothers (with optional `?flagged=true/false`)
- `GET /api/mothers/<id>` - Get specific mother
- `POST /api/mothers` - Create new mother record
- `PUT /api/mothers/<id>` - Update mother record
- `GET /api/mothers/<id>/call-logs` - Get call logs for mother
- `GET /api/mothers/flagged` - Get flagged mothers

### ASHA Workers
- `GET /api/ashas/dashboard` - Get dashboard statistics
- `GET /api/ashas/stats` - Get detailed statistics

### IVR (Voice Calls)
- `POST /api/ivr/webhook` - Webhook for Twilio/Exotel callbacks
- `POST /api/ivr/initiate-call` - Manually initiate call (requires JWT)
- `POST /api/ivr/schedule-call` - Schedule call for later (requires JWT)
- `GET /api/ivr/call-logs` - Get call logs (requires JWT)

### PHC Stock
- `GET /api/phc/stock` - Get PHC stock (requires JWT)
- `PUT /api/phc/stock` - Update PHC stock (requires JWT)

### Health Tracking
- `GET /api/health/records/<mother_id>` - Get health records
- `POST /api/health/records` - Create health record
- `GET /api/health/period-tracker/<mother_id>` - Get period tracking info
- `GET /api/health/pcos/<mother_id>` - Get PCOS information
- `GET /api/health/post-pregnancy/<mother_id>` - Get post-pregnancy info

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/<id>` - Update appointment
- `GET /api/appointments/upcoming` - Get upcoming appointments

## IVR Integration

### Twilio Setup
1. Sign up for Twilio account
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to `.env` file
5. Set webhook URL in Twilio console: `http://your-domain.com/api/ivr/webhook`

### Call Flow
1. System initiates call via Twilio API
2. Twilio calls mother's phone
3. When answered, Twilio POSTs to `/api/ivr/webhook`
4. System responds with TwiML (Tamil/Telugu voice prompts)
5. User presses DTMF keys (1, 2, 3)
6. System processes input and flags if needed
7. Call ends, system logs result

## Database Models

- **ASHA** - ASHA worker accounts
- **Mother** - Patient/mother records
- **PHCStock** - PHC inventory
- **CallLog** - IVR call history
- **HealthRecord** - Health tracking (periods, symptoms, etc.)
- **Appointment** - Appointment scheduling
- **IVRSchedule** - Scheduled IVR calls

## Development

```bash
# Run with auto-reload
export FLASK_ENV=development
python app.py
```

## Production

Use a WSGI server like Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

