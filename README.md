# ViMind — Early Mental Health Detection Platform for Students

>## Detect early. Track continuously. Understand your mental health—privately and intelligently.

ViMind is a web-based mental health platform that combines an expert system (Certainty Factor) and AI-powered chatbot to help users—especially Gen Z and students—identify early signs of mental health conditions and monitor their well-being over time.

## 🧭 Overview

ViMind acts as a digital mental health companion, enabling users to assess, understand, and track their psychological condition independently.

In Indonesia, mental health is still often stigmatized. Many individuals hesitate to seek professional help due to fear of judgment, causing early symptoms to go unnoticed.

ViMind addresses this gap by providing an accessible, private, and intelligent platform for early detection and continuous monitoring—empowering users to take control of their mental well-being and seek help when needed.

## ✨ Main Features

### 🧠 Mental Health Check (Self-Assessment)
- Interactive questionnaire powered by the **Certainty Factor (CF)** algorithm.
- **Progress Resilience**: Answers are saved automatically to `localStorage`. If the internet fails or the tab closes, users can resume their test without losing any progress.

### 💬 AI Mental Health Chatbot
- Provides real-time mental health assistance using the latest test results as context.
- Integrated deeply with the user dashboard for immediate support.

### 🌟 Feedback & Rating System
- **Mandatory Rating (Hard-Lock)**: Users must rate the platform before viewing their diagnosis results for the first time, ensuring continuous and authentic feedback collection.
- **User Comments**: Users can leave detailed comments (testimonials) after completing their assessment.
- **Admin Moderation**: Admins can review, approve, or hide testimonials to be displayed on the landing page.

### 🌊 Seamless User Flow
- **Guest-to-User Conversion**: Unregistered users who take the test are seamlessly redirected through account creation and profile completion, landing directly on their saved diagnosis results along with a daily mood tracker check-in.

### 🌎 Global Accessibility
- **Auto-Translate**: Integrated Google Translate plugin (Bottom-Right) allowing users to access the platform in various languages instantly.

### 👑 Admin System & Analytics (Super Admin)
- **Advanced Dashboard Analytics**: Real-time tracking of Weekly Active Users, Top Diseases, Age Demographics, User Regions (via IP tracking), and Account Deletion Insights.
- **User Management**: Comprehensive table tracking registered users, their roles, IP-based regions, and last active timestamps.
- **Content Management**: Full CRUD for Promotions/Banners (including dashboard links), FAQ, and News.
- **Knowledge Base Management**: Direct control over the Certainty Factor rules, symptom definitions, and disease descriptions.
- **Mobile-Responsive Design**: Fully optimized UI for administrators on both desktop and mobile devices.

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
<summary><b>Click to expand Full API Documentation</b></summary>

### 🔐 Security & Authorization (Admin)
All endpoints under `/api/admin` require a security header for role-based authorization.
- **Header**: `X-Admin-Email`
- **Value**: An email registered with `role: 'admin'`.
- **Logic**: Backend middleware verifies the role in the database before granting access.

---

### 🌍 Public & User Endpoints

#### `GET /api/questions`
Fetches screening questions.
- **Query Params**: `mode` (screening|refined), `email` (optional).
- **Response**: `{"questions": [...], "is_refined": bool, "history_disease_id": int}`

#### `POST /api/questions/discovery`
Analyzes Phase 1 answers and fetches follow-up questions.
- **Body**: `{"answers": [{"symptom_id": int, "value": float}]}`
- **Response**: `{"questions": [...]}`

#### `POST /api/diagnose`
Final CF calculation and result saving.
- **Body**: `{"answers": [...], "user_email": "...", "refined_disease_id": int}`

#### `GET /api/faq` | `GET /api/banners` | `GET /api/testimonials`
Fetches dynamic content for public pages.

#### `POST /api/testimonials` | `POST /api/account_feedbacks`
User engagement and feedback submission.

#### `GET /api/profile` | `POST /api/profile` | `DELETE /api/profile`
User account and preference management.

---

### 👑 Admin Management (Requires X-Admin-Email)

#### `GET /api/admin/banners` | `POST /api/admin/banners`
Full CRUD for dashboard promotions.

#### `GET /api/admin/faq` | `POST /api/admin/faq`
Full CRUD for landing page FAQs.

#### `GET /api/admin/symptoms` | `PUT /api/admin/symptoms`
Management of symptoms in the knowledge base.

#### `GET /api/admin/rules` | `PUT /api/admin/rules`
Direct management of Expert Weights (CF Values) and rule mappings.

#### `GET /api/admin/testimonials` | `PUT /api/admin/testimonials/:id/display`
Moderation of user feedback for landing page visibility.

#### `GET /api/admin/account_feedbacks`
Tracking and analysis of user exit surveys (deletion reasons).

#### `GET /api/admin/analytics` | `GET /api/admin/users`
Aggregated statistics for the admin dashboard, including disease rates, demographic distributions, and comprehensive user lists.

</details>

---

## 🛠️ Technical Implementation Details

### 💾 Progress Resilience (Anti-Internet Error)
*   **Mechanism**: The frontend uses `localStorage` to save the state of `currentQuestionIndex` and `answers` on every interaction.
*   **Recovery**: On component mount, the system checks for existing progress. If found, it prompts the user to resume or start fresh, ensuring no data is lost during network instability.
*   **Data Structure**: Answers are keyed by `symptom_id` in a JSON object to maintain O(1) lookup during the diagnosis calculation.

### 🌐 Global Translation (Google Translate Plugin)
*   **Implementation**: Injected via a `<script>` tag in `index.html`.
*   **UI Optimization**: Custom CSS is applied to override the default Google Translate `iframe` positioning (fixed at `bottom-right`) to prevent layout shifting and overlap with the Admin Sidebar.

### 🌟 Feedback & Moderation Logic
*   **Data Integrity**: Testimonials are stored with a default `is_displayed = false` status.
*   **Filtering**: The public endpoint `/api/testimonials` uses a strict SQL filter (`WHERE is_displayed = true`) and a limit of 6 to optimize Landing Page performance (LCP).
*   **Admin Control**: A dedicated `PUT` endpoint updates the boolean flag in the Supabase `testimonials` table, triggering an immediate update on the frontend via React's state re-fetching.

### 👑 Admin CRUD & Architecture
*   **Pattern**: Follows the **Repository Pattern** in Go. All SQL queries are parameterized to prevent SQL Injection.
*   **Dynamic Routing**: The backend uses Fiber groups to separate `/api/public` and `/api/admin` routes, allowing for different middleware/rate-limiting strategies in the future.
*   **Frontend Rendering**: The Admin Panel uses `Promise.all` for batch fetching (Symptoms, Diseases, Rules) to minimize loading states and provide a snappy UX.
*   **Analytics Optimization**: Dashboard data is aggregated using concurrent Go routines (`sync.WaitGroup`) to query multiple complex statistics simultaneously without blocking the main thread.

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

