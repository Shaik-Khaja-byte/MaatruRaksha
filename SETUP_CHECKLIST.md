# Twilio Setup Checklist

Follow these steps in order:

## ✅ Step 1: Get Twilio Credentials

- [ ] Go to https://console.twilio.com/
- [ ] Copy **Account SID** (starts with `AC...`)
- [ ] Copy **Auth Token** (click to reveal)
- [ ] Copy **Phone Number** (from Phone Numbers → Active numbers)

## ✅ Step 2: Enter Credentials

- [ ] Open `backend/.env` file
- [ ] Replace `ENTER_YOUR_TWILIO_ACCOUNT_SID_HERE` with your Account SID
- [ ] Replace `ENTER_YOUR_TWILIO_AUTH_TOKEN_HERE` with your Auth Token
- [ ] Replace `ENTER_YOUR_TWILIO_PHONE_NUMBER_HERE` with your Phone Number
- [ ] Save the file

## ✅ Step 3: Setup ngrok (for HTTPS webhook)

- [ ] Download ngrok: https://ngrok.com/download
- [ ] Install ngrok
- [ ] Start Flask server: `cd backend && python app.py`
- [ ] In new terminal, run: `ngrok http 5000`
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## ✅ Step 4: Update Webhook URL

- [ ] Open `backend/.env` file again
- [ ] Replace `https://your-ngrok-url.ngrok.io` with your actual ngrok URL
- [ ] Save the file

## ✅ Step 5: Configure Twilio Webhook

- [ ] Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
- [ ] Click on your phone number
- [ ] In "A CALL COMES IN" field, enter: `https://YOUR-NGROK-URL.ngrok.io/api/ivr/webhook`
- [ ] Set HTTP method to: **POST**
- [ ] Click **Save**

## ✅ Step 6: Restart Flask

- [ ] Stop Flask server (Ctrl+C)
- [ ] Restart: `python app.py`

## ✅ Step 7: Test

- [ ] Login to dashboard
- [ ] Try initiating a call
- [ ] Check Twilio console → Monitor → Logs → Calls
- [ ] Check Flask server logs for webhook requests

## 🎉 Done!

Your Twilio integration is now configured!

