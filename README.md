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

## 🧠 Certainty Factor (CF) Algorithm Implementation

ViMind uses the **Certainty Factor (CF)** method, a classic expert system algorithm designed to handle uncertainty in diagnosis.

### 1. Data Components
*   **Expert CF (MB - Measure of Belief)**: Pre-defined weights in our database (`cf_rules` table) that represent how strongly a symptom indicates a specific mental health condition. Range: `(0.0 to 1.0)`.
*   **User Value (MD - Measure of Disbelief/Certainty)**: Input from the patient during the questionnaire.
    *   *Sangat Setuju*: `1.0`
    *   *Setuju*: `0.8`
    *   *Ragu-ragu*: `0.5`
    *   *Tidak Setuju*: `0.2`
    *   *Sangat Tidak Setuju*: `0.0`

### 2. Calculation Logic (Backend Go)
The diagnosis process follows these mathematical steps:

#### A. Individual Symptom Calculation
For every symptom answered by the user, we calculate the individual certainty:
`CF(h,e) = User_Value * Expert_CF`

#### B. Combination Formula (Aggregation)
To combine multiple symptoms for the same disease, we use the sequential combination formula:
`CF_combine(CF_old, CF_new) = CF_old + CF_new * (1 - CF_old)`

*This ensures that as more symptoms are confirmed, the overall certainty increases asymptotically towards 100%, but never exceeds it.*

#### C. Final Diagnosis
The system processes all 9 supported conditions simultaneously. The condition with the highest `CF_combine` value is selected as the top result and presented to the user with a percentage (`CF * 100`).

### 3. Database Mapping
The logic is fully decoupled and data-driven:
*   **symptoms**: Dynamic inventory of mental health symptoms.
*   **disease**: Descriptions and professional recommendations.
- **cf_rules**: The "Knowledge Base" connecting symptoms to diseases with expert weights. Recently **clinically validated** against WHO and APA diagnostic standards (March 2026) to ensure mapping accuracy for conditions like PTSD and Anxiety.

### 4. Adaptive Discovery Flow (Intelligent Questioning)
To improve diagnostic accuracy and user experience, ViMind employs a **2-Phase Discovery Flow**:
- **Phase 1 (Screening)**: The system samples broad, high-impact symptoms across all supported conditions to identify potential "signals".
- **Phase 2 (Targeted Discovery)**: Based on real-time scoring of Phase 1 answers, the frontend intelligently requests additional, specific symptoms for suspected conditions. This provides a deep-dive analysis without asking irrelevant questions.

### 5. Dynamic News & Resource Optimization
ViMind features a real-time mental health news feed on the Dashboard:
- **Live Fetcher (Go)**: The backend automatically retrieves the latest 10 mental health articles using the Google News RSS engine.
- **In-Memory Caching (Optimization)**: To minimize external network requests and save server bandwidth, the news data is cached in-memory for **15 minutes**. This ensures lightning-fast responses during deployment and prevents API rate-limiting issues.
- **Interactive UI**: The Dashboard Carousel automatically cycles through headlines, and the "Artikel Kesehatan Mental" dropdown in the Navbar provides quick access to external sources.

### 6. Result Page & UX Enhancements
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
