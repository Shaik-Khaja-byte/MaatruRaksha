# Where to Put Your Twilio Credentials

## 📁 File Location

**Open this file:** `backend/.env`

## 🔑 What to Replace

In the `.env` file, find these 3 lines and replace the placeholder text:

### 1. Account SID
```env
TWILIO_ACCOUNT_SID=ENTER_YOUR_TWILIO_ACCOUNT_SID_HERE
```
**Replace with:** Your Account SID from Twilio Console (starts with `AC...`)

**Example:**
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
```

### 2. Auth Token
```env
TWILIO_AUTH_TOKEN=ENTER_YOUR_TWILIO_AUTH_TOKEN_HERE
```
**Replace with:** Your Auth Token from Twilio Console

**Example:**
```env
TWILIO_AUTH_TOKEN=your_actual_auth_token_here_12345
```

### 3. Phone Number
```env
TWILIO_PHONE_NUMBER=ENTER_YOUR_TWILIO_PHONE_NUMBER_HERE
```
**Replace with:** Your Twilio phone number (include the + sign)

**Example:**
```env
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Webhook URL (After ngrok setup)
```env
IVR_CALLBACK_BASE_URL=https://your-ngrok-url.ngrok.io
```
**Replace with:** Your ngrok HTTPS URL (after running `ngrok http 5000`)

**Example:**
```env
IVR_CALLBACK_BASE_URL=https://abc123def456.ngrok.io
```

## 📝 Step-by-Step

1. **Open:** `backend/.env` file in a text editor
2. **Find:** The 4 lines marked with `ENTER_YOUR_...` or `your-ngrok-url`
3. **Replace:** Each placeholder with your actual value
4. **Save:** The file
5. **Restart:** Flask server (`python app.py`)

## ✅ After Editing, Your File Should Look Like:

```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=your_actual_secret_token_here
TWILIO_PHONE_NUMBER=+1234567890
IVR_CALLBACK_BASE_URL=https://abc123.ngrok.io
```

## 🔒 Security Note

- ✅ The `.env` file is already in `.gitignore` (won't be committed to git)
- ✅ Never share your credentials publicly
- ✅ Keep this file secure

