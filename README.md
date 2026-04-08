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

Powered by Supabase Auth
Supports Google Login

Set Redirect URI:
`https://[PROJECT_REF].supabase.co/auth/v1/callback`

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

### 🔁 Returning Users

* Direct targeted questions
* Uses previous diagnosis (history-based)
* Applies CF baseline (+0.5)

## 📰 News System Optimization

* Fetches articles via Google News RSS
* Uses 15-minute in-memory caching
* Reduces API calls and improves performance

## 🛡️ Security Features

* Rate Limiting (100 requests / 15 minutes / IP)
* SQL Injection Protection (parameterized queries)
* Security Headers (Helmet middleware)
* Supabase Session Validation

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

