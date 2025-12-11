"""
IVR Service - Handles voice calls via Twilio/Exotel
"""
from flask import Response
from twilio.twiml.voice_response import VoiceResponse, Gather
import os
import requests
from config import Config

class IVRService:
    """Service for handling IVR calls"""
    
    def __init__(self):
        self.twilio_account_sid = Config.TWILIO_ACCOUNT_SID
        self.twilio_auth_token = Config.TWILIO_AUTH_TOKEN
        self.twilio_phone = Config.TWILIO_PHONE_NUMBER
    
    def play_initial_message(self, mother):
        """
        Generate TwiML for initial call message in Tamil/Telugu
        This would be replaced with actual Tamil/Telugu audio files
        """
        response = VoiceResponse()
        
        # Greeting
        response.say(
            f"வணக்கம் {mother.name}. இது கண்ணம்மா அமைப்பிலிருந்து அழைப்பு.",
            language='ta-IN'
        )
        
        # Main message based on call type
        # For now, using English text - in production, use pre-recorded Tamil/Telugu audio
        response.say(
            "This is a reminder call from Kannamma. Press 1 if you have taken your iron tablets today. "
            "Press 2 if you need help. Press 3 to confirm your appointment.",
            language='en-IN'
        )
        
        # Gather user input
        gather = Gather(
            num_digits=1,
            action='/api/ivr/webhook',
            method='POST',
            timeout=10
        )
        response.append(gather)
        
        # If no input, repeat
        response.say("We didn't receive your response. Please call back if you need assistance.")
        response.hangup()
        
        return Response(str(response), mimetype='text/xml')
    
    def handle_call_start(self, call_sid, mother):
        """Handle when call starts"""
        return self.play_initial_message(mother)
    
    def handle_user_input(self, call_sid, mother, digits):
        """Handle user DTMF input"""
        response = VoiceResponse()
        
        if digits == '1':
            # Confirmed medication taken
            response.say("Thank you for confirming. Have a healthy day!", language='en-IN')
            # Log this as positive response
            self._log_response(mother, 'medication_confirmed', call_sid)
            
        elif digits == '2':
            # Needs help - flag for ASHA
            response.say(
                "We understand you need help. An ASHA worker will contact you soon. Thank you.",
                language='en-IN'
            )
            # Flag mother for ASHA follow-up
            from models import Mother
            from extensions import db
            mother.flagged = True
            db.session.commit()
            self._log_response(mother, 'needs_help', call_sid)
            
        elif digits == '3':
            # Appointment confirmation
            if mother.next_appointment_date:
                response.say(
                    f"Your next appointment is on {mother.next_appointment_date.strftime('%B %d')}. "
                    "Please don't miss it. Thank you!",
                    language='en-IN'
                )
            else:
                response.say("No upcoming appointment scheduled. Thank you!", language='en-IN')
            self._log_response(mother, 'appointment_confirmed', call_sid)
            
        else:
            response.say("Invalid option. Please call back if you need assistance.", language='en-IN')
        
        response.hangup()
        return Response(str(response), mimetype='text/xml')
    
    def initiate_call(self, mother, call_type='reminder'):
        """
        Initiate a call to a mother using Twilio or Exotel
        Returns: dict with success status and call_sid
        """
        try:
            # Try Exotel first if configured
            if Config.EXOTEL_API_KEY and Config.EXOTEL_API_TOKEN:
                return self.initiate_exotel_call(mother, call_type)
            
            # Fall back to Twilio
            from twilio.rest import Client
            
            if not self.twilio_account_sid or not self.twilio_auth_token:
                return {
                    'success': False,
                    'error': 'Twilio credentials not configured'
                }
            
            client = Client(self.twilio_account_sid, self.twilio_auth_token)
            
            # Build callback URL
            callback_url = f"{Config.IVR_CALLBACK_BASE_URL}/api/ivr/webhook"
            
            # Make the call
            call = client.calls.create(
                to=mother.phone,
                from_=self.twilio_phone,
                url=callback_url,
                method='POST'
            )
            
            return {
                'success': True,
                'call_sid': call.sid,
                'status': call.status
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def initiate_exotel_call(self, mother, call_type='reminder'):
        """
        Initiate a call via Exotel API
        Exotel documentation: https://exotel.com/api/#initiate-call
        """
        try:
            import base64
            
            # Prepare authentication
            auth_string = base64.b64encode(
                f"{Config.EXOTEL_API_KEY}:{Config.EXOTEL_API_TOKEN}".encode()
            ).decode()
            
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            # Build callback URL
            callback_url = f"{Config.IVR_CALLBACK_BASE_URL}/api/ivr/webhook"
            
            # Prepare call data
            payload = {
                'from': Config.TWILIO_PHONE_NUMBER,  # Your Exotel virtual number
                'to': mother.phone,
                'caller_id': Config.TWILIO_PHONE_NUMBER,
                'url': callback_url,
                'call_type': call_type
            }
            
            # Make the request to Exotel
            exotel_url = f"https://{Config.EXOTEL_SUBDOMAIN}.exotel.com/v1/Accounts/{Config.EXOTEL_API_KEY}/Calls/connect.json"
            
            response = requests.post(
                exotel_url,
                data=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                response_data = response.json()
                return {
                    'success': True,
                    'call_sid': response_data.get('Call', {}).get('Sid', 'pending'),
                    'status': 'initiated',
                    'provider': 'exotel'
                }
            else:
                return {
                    'success': False,
                    'error': f'Exotel API error: {response.status_code}',
                    'details': response.text
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Exotel call failed: {str(e)}',
                'provider': 'exotel'
            }
    
    def _log_response(self, mother, response_type, call_sid):
        """Log user response"""
        from models import CallLog
        from extensions import db
        
        result_map = {
            'medication_confirmed': 'answered',
            'needs_help': 'pressed_2',
            'appointment_confirmed': 'answered'
        }
        
        call_log = CallLog(
            asha_id=mother.asha_id,
            mother_id=mother.id,
            phone=mother.phone,
            result=result_map.get(response_type, 'answered'),
            call_sid=call_sid
        )
        
        db.session.add(call_log)
        db.session.commit()

