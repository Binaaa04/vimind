# ViMind Project
(npm dotenv)
ViMind is a mental health management application using **Go (Fiber)** for the backend and **React (Vite)** for the frontend, with **Supabase** integration for database and authentication.

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Go](https://go.dev/) (v1.20+ recommended)
- Git

## Project Setup (Post Git Pull)

### 1. Backend (Go)
Navigate to the backend directory and install dependencies:
```bash
cd backend
go mod tidy
```

**Environment Variables:**
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres.ujhyykkpfrizkgmtyvee:[YOUR_PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```
*(Replace `[YOUR_PASSWORD]` with our database password)*

### 2. Frontend (React)
Navigate to the frontend directory and install packages:
```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SUPABASE_URL=https://ujhyykkpfrizkgmtyvee.supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```
*(Contact the project owner for the keys)*

## Running the Application

Run both the backend and frontend in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
go run main.go
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Google Authentication
Google Login integration is powered by Supabase Auth. Ensure the Redirect URI in the Google Cloud Console is set to:
`https://ujhyykkpfrizkgmtyvee.supabase.co/auth/v1/callback`

## Core Features Implemented (March 10, 2026)

### 1. Certainty Factor (CF) Diagnosis
The application now uses a data-driven Certainty Factor algorithm for mental health screening:
- **Dynamic Questions**: Fetches symptoms directly from the database `cf_rules` table.
- **Representative Screening**: Intelligent selection of up to 5 highest-weight symptoms per disease (covering 9 mental health conditions).
- **CF Calculator**: Backend (Go) processes user certainty levels (Agree to Disagree) using the combination formula: `CF_combine = CF1 + CF2 * (1 - CF1)`.

### 2. Result Page & UX Enhancements
- **Dynamic Content**: Displays real descriptions and professional solutions fetched from the database top-match result.
- **Guest Access Control**: 
  - Partial **Blur Effect** on result cards for non-logged-in users.
  - Persistent login modal to incentivize registration for full access.
  - Header remains clear for premium visual feedback.
- **Unified Flow**: Streamlined the multi-page detection intro into a single dynamic questionnaire path.

## Security Features
This project includes several security hardening measures:
- **Rate Limiting**: Maximum 100 requests every 15 minutes per IP to prevent brute-force and DDoS.
- **SQL Injection Protection**: Uses parameterized queries for all database interactions.
- **Security Headers**: Integrated with Helmet middleware.
- **Session Validation**: Direct integration with Supabase session management for secure feature access.
