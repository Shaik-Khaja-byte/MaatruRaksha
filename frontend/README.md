# Kannamma ASHA Dashboard

A React-based dashboard prototype for ASHA (Accredited Social Health Activist) workers to manage and track maternal health care in India.

## Tech Stack

- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase** for database and backend services
- **Lucide React** for icons

## Features

- ASHA worker login with authentication
- Dashboard with 45 assigned mothers
- PHC (Primary Health Center) stock management
- Individual mother profile pages
- Call simulation feature with "Call All" functionality
- Flagged mothers tracking
- Call logs history
- CSV export of mothers list
- Responsive design

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. The project is already configured with Supabase. The database includes:
   - 2 ASHA workers
   - 45 sample mothers assigned to ASHA001
   - PHC stock data
   - Call logs system

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Demo Credentials

Use these credentials to log in:

- **ASHA ID:** ASHA001
- **Password:** password123

## Demo Script (5-10 minutes)

### 1. Login (1 minute)
- Open the application
- Enter ASHA ID: ASHA001
- Enter Password: password123
- Click "Sign In"
- You'll see the dashboard with ASHA name and PHC information

### 2. Explore Dashboard (2 minutes)
- **Left Panel:** PHC Stock - Edit iron tablets and TT vaccine counts (changes persist on refresh)
- **Center Panel:** View all 45 assigned mothers in a scrollable list
- **Right Panel:** See flagged mothers and recent call logs

### 3. View Mother Profile (1 minute)
- Click "View" on any mother card
- See complete details: name, age, phone, address, gestation week, last ANC date, notes
- Notice the flagged status badge if applicable

### 4. Individual Call Simulation (1 minute)
- On a mother's profile, click "Call Mother"
- Click "Start Call" to simulate calling
- Wait for the prompt to appear
- Press "1" (Yes - medicine taken) or "2" (No - not taken)
- If you press "2", the mother gets flagged automatically
- A call log entry is created

### 5. Call All Feature (2 minutes)
- Return to dashboard
- Click the large "CALL ALL" button in the center panel
- Watch the simulation:
  - Each mother is "called" with a short delay
  - Results are randomly assigned: 70% answered, 20% no answer, 10% pressed 2
  - Mothers who didn't answer or pressed 2 are automatically flagged
- See the summary at the end: answered, no answer, not taken counts
- Close the modal and observe:
  - Flagged mothers list updates
  - Call logs populate with all new calls

### 6. Mark as Visited (30 seconds)
- Click "Mark Visited" on any mother card
- The mother's visited status updates
- If flagged, the flag is removed

### 7. CSV Export (30 seconds)
- Click "Export CSV" button
- A CSV file with all 45 mothers' data downloads automatically

### 8. Logout (10 seconds)
- Click the "Logout" button in the header
- You're redirected to the login page

## Project Structure

```
src/
├── components/
│   ├── CallAllModal.tsx         # Simulates calling all mothers
│   ├── CallLogsList.tsx         # Displays recent call logs
│   ├── FlaggedMothersList.tsx   # Shows flagged mothers
│   ├── MotherCard.tsx           # Individual mother card component
│   ├── PHCStockPanel.tsx        # PHC stock management
│   ├── ProtectedRoute.tsx       # Route protection wrapper
│   └── SingleCallModal.tsx      # Single mother call simulation
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── lib/
│   └── supabase.ts              # Supabase client and types
├── pages/
│   ├── Dashboard.tsx            # Main dashboard view
│   ├── Login.tsx                # Login page
│   └── MotherProfile.tsx        # Individual mother profile
├── App.tsx                      # Main app component
├── Router.tsx                   # Simple client-side router
└── main.tsx                     # Application entry point
```

## Database Schema

The Supabase database includes these tables:

- **ashas** - ASHA worker accounts
- **mothers** - Pregnant women assigned to ASHA workers
- **phc_stock** - PHC stock levels (iron tablets, TT vaccine)
- **call_logs** - History of all simulated calls

## Key Features Explained

### Call Simulation
The "Call All" feature simulates calling all assigned mothers without any real telephony integration. Each call randomly results in:
- 70% chance: Answered (medicine taken)
- 20% chance: Not answered
- 10% chance: Pressed 2 (medicine not taken)

Mothers who don't answer or press 2 are automatically flagged for follow-up.

### Flagging System
Mothers can be flagged through:
- Manual flagging on their profile page
- Automatic flagging when they don't answer or press 2 during calls

Flagged mothers appear in the dedicated "Flagged Mothers" panel for quick access.

### Data Persistence
All data is stored in Supabase:
- PHC stock updates persist across sessions
- Call logs are recorded with timestamps
- Mother status (flagged, visited) updates immediately
- Authentication session is maintained in localStorage

## Notes

- This is a prototype/demo application
- No real phone calls are made - all calling functionality is simulated
- The database is pre-populated with 45 sample mothers
- All dates and data are fictional for demonstration purposes
- No external API keys or secrets are required

## Browser Compatibility

Tested and working on:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Support

This is a demo application built for educational and prototype purposes.
