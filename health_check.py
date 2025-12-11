#!/usr/bin/env python3
"""
API Health Check & Testing Script for Kannamma Backend
Tests all endpoints and Exotel integration
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:5000/api"
ASHA_ID = "ASHA001"
PASSWORD = "password123"

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_header(text):
    print(f"\n{BOLD}{BLUE}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    print(f"{RED}✗ {text}{RESET}")

def print_info(text):
    print(f"{YELLOW}ℹ {text}{RESET}")

def print_test(text):
    print(f"{BLUE}► {text}{RESET}")

def check_server_running():
    """Check if Flask server is running"""
    print_header("1. Server Status Check")
    try:
        response = requests.get("http://localhost:5000/", timeout=2)
        print_success(f"Flask server is running")
        return True
    except requests.exceptions.ConnectionError:
        print_error("Flask server is NOT running")
        print_info("Start backend: cd backend && python app.py")
        return False
    except Exception as e:
        print_error(f"Error checking server: {str(e)}")
        return False

def test_health_endpoint():
    """Test health check endpoint"""
    print_header("2. Health Check Endpoint")
    try:
        response = requests.get(f"{API_BASE_URL}/health/status", timeout=5)
        if response.status_code == 200:
            print_success("Health endpoint is working")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print_error(f"Health endpoint returned: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health endpoint error: {str(e)}")
        return False

def test_login():
    """Test login endpoint"""
    print_header("3. Login Endpoint")
    try:
        print_test(f"Attempting login with ASHA ID: {ASHA_ID}")
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json={"asha_id": ASHA_ID, "password": PASSWORD},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            print_success("Login successful")
            print(f"  Token: {token[:20]}...")
            print(f"  ASHA ID: {data.get('asha', {}).get('asha_id')}")
            return token
        else:
            print_error(f"Login failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None

def test_get_mothers(token):
    """Test get mothers endpoint"""
    print_header("4. Get Mothers Endpoint")
    if not token:
        print_error("No token available (login failed)")
        return []
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_BASE_URL}/mothers",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            mothers = response.json()
            print_success(f"Retrieved {len(mothers)} mothers")
            for i, mother in enumerate(mothers[:2], 1):
                print(f"\n  Mother {i}:")
                print(f"    Name: {mother.get('name')}")
                print(f"    Phone: {mother.get('phone')}")
                print(f"    Flagged: {mother.get('flagged')}")
                print(f"    ID: {mother.get('id')}")
            return mothers
        else:
            print_error(f"Get mothers failed: {response.status_code}")
            return []
    except Exception as e:
        print_error(f"Get mothers error: {str(e)}")
        return []

def test_get_flagged_mothers(token):
    """Test get flagged mothers endpoint"""
    print_header("5. Get Flagged Mothers Endpoint")
    if not token:
        print_error("No token available")
        return []
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_BASE_URL}/mothers/flagged",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            flagged = response.json()
            print_success(f"Retrieved {len(flagged)} flagged mothers")
            if flagged:
                for mother in flagged[:1]:
                    print(f"\n  Flagged Mother:")
                    print(f"    Name: {mother.get('name')}")
                    print(f"    Phone: {mother.get('phone')}")
                    print(f"    ID: {mother.get('id')}")
            return flagged
        else:
            print_error(f"Get flagged mothers failed: {response.status_code}")
            return []
    except Exception as e:
        print_error(f"Get flagged mothers error: {str(e)}")
        return []

def test_get_call_logs(token):
    """Test get call logs endpoint"""
    print_header("6. Call Logs Endpoint")
    if not token:
        print_error("No token available")
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_BASE_URL}/ivr/call-logs",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            logs = response.json()
            print_success(f"Retrieved {len(logs)} call logs")
            if logs:
                for log in logs[:2]:
                    print(f"\n  Call Log:")
                    print(f"    Phone: {log.get('phone')}")
                    print(f"    Result: {log.get('result')}")
                    print(f"    Time: {log.get('created_at')}")
                    print(f"    Call SID: {log.get('call_sid', 'N/A')}")
        else:
            print_error(f"Get call logs failed: {response.status_code}")
    except Exception as e:
        print_error(f"Get call logs error: {str(e)}")

def test_phc_stock(token):
    """Test PHC stock endpoint"""
    print_header("7. PHC Stock Endpoint")
    if not token:
        print_error("No token available")
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{API_BASE_URL}/phc/stock",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            stock = response.json()
            print_success("PHC stock retrieved")
            print(f"\n  Stock Levels:")
            print(f"    Iron Tablets: {stock.get('iron_tablets')}")
            print(f"    TT Vaccine: {stock.get('tt_vaccine')}")
            print(f"    Folic Acid: {stock.get('folic_acid')}")
            print(f"    Calcium Tablets: {stock.get('calcium_tablets')}")
        else:
            print_error(f"Get PHC stock failed: {response.status_code}")
    except Exception as e:
        print_error(f"Get PHC stock error: {str(e)}")

def test_trigger_call(token, mother_id):
    """Test trigger call endpoint"""
    print_header("8. Trigger Call Endpoint (NEW)")
    if not token:
        print_error("No token available")
        return
    
    if not mother_id:
        print_error("No mother ID available")
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"call_type": "test_check"}
        
        print_test(f"Attempting to trigger call for mother: {mother_id}")
        print_info("This requires Exotel credentials in .env file")
        
        response = requests.post(
            f"{API_BASE_URL}/mothers/{mother_id}/trigger-call",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success(f"Call triggered successfully!")
                print(f"  Message: {data.get('message')}")
                print(f"  Call SID: {data.get('call_sid')}")
                print(f"  Provider: {data.get('provider', 'unknown')}")
            else:
                print_error(f"Call trigger returned success=false")
                print(f"  Response: {json.dumps(data, indent=2)}")
        else:
            data = response.json()
            if data.get('success') == False:
                error = data.get('error', 'Unknown error')
                print_error(f"Call trigger failed: {error}")
                details = data.get('details')
                if details:
                    print(f"  Details: {details}")
            else:
                print_error(f"Call endpoint returned: {response.status_code}")
                print(f"  Response: {response.text}")
                
    except requests.exceptions.Timeout:
        print_error("Call endpoint timed out (Exotel might be slow or not configured)")
    except Exception as e:
        print_error(f"Trigger call error: {str(e)}")

def test_update_mother(token, mother_id):
    """Test update mother endpoint"""
    print_header("9. Update Mother Endpoint")
    if not token or not mother_id:
        print_error("No token or mother ID available")
        return
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {"flagged": True, "visited": False}
        
        print_test(f"Attempting to flag mother: {mother_id}")
        response = requests.put(
            f"{API_BASE_URL}/mothers/{mother_id}",
            json=payload,
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            mother = response.json()
            print_success("Mother updated successfully")
            print(f"  Name: {mother.get('name')}")
            print(f"  Flagged: {mother.get('flagged')}")
            print(f"  Visited: {mother.get('visited')}")
        else:
            print_error(f"Update mother failed: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print_error(f"Update mother error: {str(e)}")

def check_env_configuration():
    """Check if .env file has required configuration"""
    print_header("10. Configuration Check")
    try:
        import os
        from dotenv import load_dotenv
        
        # Load .env from backend directory
        env_path = "C:\\Users\\haris\\OneDrive\\Pictures\\Desktop\\kannama\\backend\\.env"
        load_dotenv(env_path)
        
        print_test("Checking .env configuration...")
        
        configs = {
            "TWILIO_ACCOUNT_SID": os.getenv("TWILIO_ACCOUNT_SID"),
            "TWILIO_AUTH_TOKEN": os.getenv("TWILIO_AUTH_TOKEN"),
            "TWILIO_PHONE_NUMBER": os.getenv("TWILIO_PHONE_NUMBER"),
            "EXOTEL_API_KEY": os.getenv("EXOTEL_API_KEY"),
            "EXOTEL_API_TOKEN": os.getenv("EXOTEL_API_TOKEN"),
            "EXOTEL_SUBDOMAIN": os.getenv("EXOTEL_SUBDOMAIN"),
            "IVR_CALLBACK_BASE_URL": os.getenv("IVR_CALLBACK_BASE_URL"),
        }
        
        for key, value in configs.items():
            if value:
                masked = value[:10] + "***" if len(str(value)) > 10 else "***"
                print_success(f"{key}: {masked}")
            else:
                print_info(f"{key}: Not configured")
    except Exception as e:
        print_error(f"Configuration check error: {str(e)}")

def print_summary():
    """Print summary and recommendations"""
    print_header("API Health Check Summary")
    print(f"""
{BOLD}What You Should See:{RESET}
  ✓ Server is running
  ✓ Health endpoint responds
  ✓ Login works with ASHA001/password123
  ✓ Can retrieve mothers list
  ✓ Can retrieve call logs
  ✓ Can retrieve PHC stock

{BOLD}For Trigger Call to Work:{RESET}
  1. Exotel or Twilio credentials in .env
  2. ngrok running (if local testing)
  3. IVR_CALLBACK_BASE_URL set to ngrok URL

{BOLD}To Test Trigger Call:{RESET}
  1. Configure Exotel credentials
  2. Start ngrok: ngrok http 5000
  3. Update IVR_CALLBACK_BASE_URL in .env
  4. Restart Flask server
  5. Run this script again

{BOLD}Common Issues:{RESET}
  • Connection refused → Backend not running
  • Login fails → Check credentials in .env
  • Call trigger fails → Missing Exotel credentials
  • Timeout on call → Credentials invalid or ngrok not running
""")

def main():
    print(f"\n{BOLD}{BLUE}╔════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BOLD}{BLUE}║     KANNAMMA API - Health Check & Testing Script          ║{RESET}")
    print(f"{BOLD}{BLUE}║     {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}                                          ║{RESET}")
    print(f"{BOLD}{BLUE}╚════════════════════════════════════════════════════════════╝{RESET}\n")
    
    # Step 1: Check server
    if not check_server_running():
        print_error("Cannot proceed without running server")
        print_info("Start backend with: cd backend && python app.py")
        return
    
    # Step 2: Check configuration
    check_env_configuration()
    
    # Step 3: Test health
    test_health_endpoint()
    
    # Step 4: Test login
    token = test_login()
    if not token:
        print_error("Cannot proceed without valid token")
        return
    
    # Step 5: Get mothers
    mothers = test_get_mothers(token)
    
    # Step 6: Get flagged mothers
    flagged = test_get_flagged_mothers(token)
    
    # Step 7: Get call logs
    test_get_call_logs(token)
    
    # Step 8: Get PHC stock
    test_phc_stock(token)
    
    # Step 9: Test trigger call (only if we have a flagged mother)
    if flagged:
        flagged_mother = flagged[0]
        print_info(f"Using flagged mother for call test: {flagged_mother.get('name')}")
        test_trigger_call(token, flagged_mother.get('id'))
    elif mothers:
        # Test with first mother
        test_mother = mothers[0]
        # First flag the mother
        test_update_mother(token, test_mother.get('id'))
        # Then try to call
        test_trigger_call(token, test_mother.get('id'))
    
    # Step 10: Print summary
    print_summary()
    
    print(f"\n{BOLD}{GREEN}✓ Health check complete!{RESET}\n")

if __name__ == "__main__":
    main()
