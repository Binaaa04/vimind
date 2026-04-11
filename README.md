# ViMind — Early Mental Health Detection Platform for Students

ViMind is a web-based mental health application designed to help users—especially Gen Z and university students—detect early signs of mental health conditions. The platform provides self-assessment tools, mood tracking, and progress monitoring in a private and stigma-free environment.

## 🧭 Overview

ViMind is designed as a digital mental health companion that enables users to understand and monitor their psychological condition independently.

In Indonesia, mental health is still considered a sensitive topic. Many people hesitate to visit psychologists due to social stigma, often being labeled negatively. As a result, early symptoms are frequently ignored.

ViMind addresses this issue by providing an accessible platform for early detection and continuous monitoring. Users can evaluate their condition, track progress, and receive recommendations when professional help may be needed.

## ✨ Main Features

### 🧠 Mental Health Check (Self-Assessment)
- Interactive questionnaire based on mental health symptoms
- Generates early diagnosis with percentage results
- Powered by Certainty Factor (CF) algorithm

### 😊 Mood Condition Summary
- Provides an overview of user emotional states
- Helps identify mood patterns over time

### 📈 Test Progress Tracking
- Displays history of test results
- Visualizes improvement or deterioration

### ⚠️ Early Warning Recommendation
- Detects worsening conditions
- Recommends consulting a psychologist

### 📰 Mental Health News
- Displays latest mental health articles
- Fetched dynamically from Google News

### 🔄 Seamless Guest Synchronization
- Users can start tests as a Guest
- Test results automatically sync to the user profile after Login/Registration

### 🔐 Account Management
- Self-service **Forgot Password** (Email reset link)
- Account Deletion (Right to be Forgotten)

## ⚙️ Tech Stack

| Category              | Technology                   |
|-----------------------|------------------------------|
| Frontend              | React (Vite)                 |
| Backend               | Go (Fiber)                   |
| Database              | Supabase (PostgreSQL)        |
| Authentication        | Supabase Auth (Google Login) |
| API                   | REST API                     |
| Version Control       | GitHub                       |

## 🚀 Installation & Setup

### 📌 Prerequisites

Make sure you have installed:

- Node.js (v18+)
- Go (v1.20+)
- Git

### 🔧 Backend Setup (Go - Fiber)

```bash
cd backend
go mod tidy
````

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### 🎨 Frontend Setup (React - Vite)

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

⚠️ Use `127.0.0.1` instead of `localhost` to avoid IPv4/IPv6 issues on some systems.

### ▶️ Running the Application

**Terminal 1 — Backend**

```bash
cd backend
go run main.go
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Open in browser:
[http://localhost:5173](http://localhost:5173)

### 🔐 Authentication

Powered by Supabase Auth. Supports Google Login and Email/Password with **Automatic Password Reset** flow.

Set Redirect URI in Supabase Dashboard:
`http://localhost:5173/reset-password` (for local development)
`https://[PROJECT_URL]/reset-password` (for production)

## 🧠 Core Algorithm — Certainty Factor (CF)

ViMind uses the Certainty Factor (CF) method, a classic expert system approach for handling uncertainty in diagnosis.

### 🔹 Data Components

* **Expert CF (MB)** → Predefined expert weight (0–1)
* **User Value (MD)** → User input during test:

  * Strongly Agree → 1.0
  * Agree → 0.7
  * Neutral → 0.4
  * Disagree → 0.0

### 🔹 Calculation Logic

* **A. Individual CF**

```math
CF(h,e) = User_Value × Expert_CF
```

* **B. Combination Formula**

```math
CFcombine = CFold + CFnew × (1 - CFold)
```

* **C. Final Diagnosis**

All conditions are evaluated simultaneously. Highest CF value is selected as the result.

### 🔹 Database Structure

* **symptoms** → symptom list
* **disease** → mental conditions & solutions
* **cf_rules** → knowledge base mapping

## 🔄 Adaptive Discovery System

### 👤 New Users

* Phase 1: General screening
* Phase 2: Targeted follow-up questions

### 🔄 Data Persistence & Synchronization
ViMind features a seamless data flow for unregistered users:
* **Guest Flow**: Test results are stored in `localStorage`.
* **Auto-Sync**: Upon login/registration, the `onAuthStateChange` listener in `App.jsx` detects the session and automatically triggers an API call to migrate `pending_answers` to the database.
* **Result Redirect**: After successful sync, users are automatically redirected to their full dashboard/results.

### 🧠 Adaptive Discovery Logic (Returning Users)
When a returning user starts a test, the system behaves intelligently:
* **Context Recognition**: The backend fetches the last diagnosed condition.
* **Targeted Questions**: If a prior condition exists (e.g., Depression), the system skips general screening and presents symptoms specific to that condition for deeper analysis.
* **History Bias**: A Certainty Factor baseline of **+0.5** is applied to the prior condition, anchoring the new diagnosis to the user's history for better trend tracking.

## 📰 News System Optimization

* Fetches articles via Google News RSS
* Uses 15-minute in-memory caching
* Reduces API calls and improves performance

## 🛡️ Security Features

* **Strict Rate Limiting** (50 requests / 1 minute / IP) to prevent DDoS and Brute Force spam.
* **Middleware Recover**: System resilience layer that prevents the Go server from crashing during internal panics.
* **Input Range Validation**: Backend-side enforcement (0.0–1.0) for symptom values to prevent data manipulation.
* **SQL Injection Protection**: Fully parameterized queries via Golang's database/sql.
* **Security Headers**: Integrated Helmet middleware for XSS, Sniffing, and Clickjacking protection.

---

## 📁 Technical API Reference

<details>
<summary><b>Click to expand Backend API Details</b></summary>

### 📡 Diagnostic Endpoints

#### `GET /api/questions`
Fetches questions based on the user's current session or intent.
- **Query Params**:
  - `mode`: (`screening`|`refined`)
  - `email`: (optional) used to fetch history for refined mode.
- **Response**: List of questions, `is_refined` flag, and `history_disease_id`.

#### `POST /api/diagnose`
Submits answers and calculates the CF result.
- **Request Body**:
  ```json
  {
    "answers": [{"symptom_id": 1, "value": 0.8}],
    "user_email": "user@example.com",
    "refined_disease_id": 0
  }
  ```
- **Response**: `top_result` (highest CF) and `all_results`.

### 👤 Profile & History

#### `GET /api/profile?email={email}`
Fetches user information and avatar.

#### `GET /api/history?email={email}`
Fetches the full diagnostic history of a user.

#### `DELETE /api/profile?email={email}`
Permanently deletes user account and all associated diagnostic data (cascade delete).

### 📰 News

#### `GET /api/news`
Fetches mental health news from Google News RSS with 15-minute server-side caching.

</details>

---

## 🚀 Future Development

* 💬 AI Mental Health Chatbot
* 📊 Advanced Mood Analytics
* 🏥 Psychologist Integration (consultation booking)

## 👥 Development Team

| Name              | Role                    |
| ----------------- | ----------------------- |
| Sabrina Rahmadini | Project Manager & QA    |
| Shabrina Q        | Database                |
| Ardhiofatra       | Frontend Developer      |
| Dimas Arya        | Backend Developer       |
| M. Faruq          | UI/UX Designer          |

## 📸 UI Preview

## Landing Page
<p align="center">
<img src="frontend\src\assets\landing.PNG" width="250"/>
<img src="frontend\src\assets\login page.PNG" width="250"/>
<img src="frontend\src\assets\Locked Result Page.PNG" width="250"/>
</p>

## Dashboard Page
<p align="center">
<img src="frontend\src\assets\dashboard page.PNG" width="250"/>
<img src="frontend\src\assets\dashboard page2.PNG" width="250"/>
</p>

## Mental Health Check (Self-Assessment)
<p align="center">
<img src="frontend\src\assets\question.PNG" width="250"/>
<img src="frontend\src\assets\question2.PNG" width="250"/>
</p>

## Mood Condition Summary
<p align="center">
<img src="frontend\src\assets\dashboard page.PNG" width="250"/>
<img src="frontend\src\assets\Mood Condition Summary.PNG" width="250"/>
</p>

## Test Progress Tracking
<p align="center">
<img src="frontend\src\assets\Test Progress Tracking.PNG" width="250"/>
</p>

## Early Warning Recommendation
<p align="center">
<img src="frontend\src\assets\Picture3.png" width="250"/>
</p>

## Mental Health News
<p align="center">
<img src="frontend\src\assets\news.PNG" width="250"/>
<img src="frontend\src\assets\news2.PNG"  width="250"/>
</p>

## Profile
<p align="center">
<img src="frontend\src\assets\change name.PNG" width="250"/>
<img src="frontend\src\assets\change name2.PNG" width="250"/>
<img src="frontend\src\assets\change picture.PNG" width="250"/>
<img src="frontend\src\assets\logout.PNG" width="250"/>
</p>

