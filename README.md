# ViMind — Early Mental Health Detection Platform for Students

>## Detect early. Track continuously. Understand your mental health—privately and intelligently.

ViMind is a web-based mental health platform that combines an expert system (Certainty Factor) and AI-powered chatbot to help users—especially Gen Z and students—identify early signs of mental health conditions and monitor their well-being over time.

## 🧭 Overview

ViMind acts as a digital mental health companion, enabling users to assess, understand, and track their psychological condition independently.

In Indonesia, mental health is still often stigmatized. Many individuals hesitate to seek professional help due to fear of judgment, causing early symptoms to go unnoticed.

ViMind addresses this gap by providing an accessible, private, and intelligent platform for early detection and continuous monitoring—empowering users to take control of their mental well-being and seek help when needed.

## ✨ Main Features

### 🧠 Mental Health Check (Self-Assessment)
- Interactive questionnaire based on mental health symptoms
- Generates early diagnosis with percentage results
- Powered by Certainty Factor (CF) algorithm

### 🔄 Test Flow (After Login)
Users can choose:

- **Continue Previous Condition**  
  Resume the last test without restarting  

- **Detect New Condition**  
  Start a new diagnosis with updated symptoms  

### 😊 Mood Condition Summary
- Provides an overview of user emotional states
- Helps identify mo### 💬 AI Mental Health Chatbot
- Provides real-time mental health assistance  
- Uses latest test results as contextual input  
- Integrated deeply with the user dashboard for quick access

### 🌟 Feedback & Testimonial System
- Post-diagnostic ratings and comments
- Integrated feedback loop for account deletion
- Dynamic testimonial showcase on the landing page

### 📰 Dynamic System Management
- Admin-controlled Banners/Promotions for the dashboard
- Real-time FAQ updates through the admin panel

### 👑 Admin System (Super Admin)
- **Role-Based Access**: Automatic redirection to `/admin` for authorized accounts.
- **Content CRUD**: Full management of Promotions, FAQ, and Articles.
- **Knowledge Base Management**: Direct control over the Certainty Factor rules, symptom definitions, and disease solutions.
- **Feedback Moderation**: Review and approve user testimonials for public display.
- **Mobile-Responsive Design**: Fully optimized UI for administrators on the go.

## ⚙️ Tech Stack

| Category              | Technology                   |
|-----------------------|------------------------------|
| Frontend              | React (Vite)                 |
| Backend               | Go (Fiber)                   |
| Database              | Supabase (PostgreSQL)        |
| Authentication        | Supabase Auth (Role-based)   |
| API                   | REST API                     |
| Styling               | Vanilla CSS (Glassmorphism)  |

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
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your_api_key_here
```

### 🎨 Frontend Setup (React - Vite)

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

---

## 🧠 Core Algorithm — Certainty Factor (CF)

ViMind uses the Certainty Factor (CF) method, a classic expert system approach for handling uncertainty in diagnosis.

### 🔹 Data Components

* **Expert CF (MB)** → Predefined expert weight (0–1)
* **User Value (MD)** → User input during test (Strongly Agree to Disagree)

### 🔹 Calculation Logic

* **CFcombine = CFold + CFnew × (1 - CFold)**

---

## 🛡️ Security Features

* **Admin Security**: Patent-based admin roles with no public registration for admin accounts.
* **API Filtering**: Public endpoints (Banners/FAQ) are strictly filtered for active status.
* **DDoS Protection**: Integrated rate limiting and request validation.

---

## 📁 Technical API Reference

<details>
<summary><b>Click to expand Backend API Details</b></summary>

### 📡 Diagnostic & Public Endpoints

#### `GET /api/questions` | `POST /api/diagnose`
Core diagnostic engine using CF algorithm.

#### `GET /api/banners` | `GET /api/faq` | `GET /api/testimonials`
Dynamic public content used in Home and Dashboard pages.

### 👤 Feedback System

#### `POST /api/testimonials`
Submit a new user testimonial with rating (1-5).

#### `POST /api/account_feedbacks`
Submit reason for account deletion.

### 👑 Admin Management

#### `GET /api/admin/banners` | `POST /api/admin/banners`
Manage promotions shown to users.

#### `GET /api/admin/symptoms` | `PUT /api/admin/symptoms`
Manage the symptom knowledge base.

#### `GET /api/admin/rules` | `PUT /api/admin/rules`
Manage expert CF weights and rule mappings.

#### `PUT /api/admin/testimonials/:id/display`
Moderate user testimonials for the public Landing Page.

</details>

---

## 🚀 Future Development

* 📊 **Advanced Trend Analytics**: Visualize long-term mental health progress with detailed charts.
* 🏥 **Professional Integration**: Direct "One-Click" referral to partnered psychologists.
* 🔒 **Data Encryption**: End-to-end encryption for diagnostic history.
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
<img src="frontend\src\assets\Test Flow.PNG" width="250"/>
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
<img src="frontend\src\assets\export.PNG" width="250"/>
</p>

## Early Warning Recommendation
<p align="center">
<img src="frontend\src\assets\Picture3.png" width="250"/>
</p>

## AI Mental Health Chatbot
<p align="center">
<img src="frontend\src\assets\ai.PNG" width="250"/>
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
<img src="frontend\src\assets\forget password.PNG" width="250"/>
<img src="frontend\src\assets\deleteAccount.PNG" width="250"/>
<img src="frontend\src\assets\logout.PNG" width="250"/>
</p>

