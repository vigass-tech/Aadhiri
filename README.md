# AADHIRAI – Smart Citizen Complaint Management System
> **"Your Voice. Our Responsibility."**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-brightgreen.svg)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-18%20%7C%20Vite-cyan.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-ISC-lightgrey.svg)](LICENSE)

---

## 🏛️ Executive Summary

**AADHIRAI** is an enterprise-grade, state-level **Smart Citizen Complaint Management System** engineered using the **MERN** (MongoDB, Express.js, React.js, Node.js) full-stack architecture. It establishes an authentic, transparent, and direct grievance redressal bridge between residents and municipal governance bodies (such as Public Works, Water Supply, Electricity, and Sanitation).

Featuring a **Single Unified Authentication Portal** with strict **Role-Based Access Control (RBAC)**, AADHIRAI caters to four distinct administrative and civic actors:
1. **SUPER ADMIN** – Chief Commissioner & State Administrator
2. **ADMIN** – Zonal Municipal Administrators
3. **USER – REVIEWER** – On-Ground Technical Investigation Officers
4. **USER – CITIZEN** – Public Residents & Grievance Filers

---

## 🌟 Key Functional Features

- **🏛️ Public Citizen Portal**: Dynamic landing page featuring live municipal metrics, category overviews, 6-step interactive workflow, public contact helpline, and zero-login instant ticket tracking.
- **🔐 Unified Authentication Engine**: One single entry login page (`/login`) dynamically routing users to their designated dashboards based strictly on cryptographically verified JWT roles.
- **🛡️ 4-Tier Role-Based Dashboards**:
  - **Super Admin**: Statewide metrics, department creation, admin appointment, reviewer governance, citizen management, budget oversight, and interactive visual charts (Recharts).
  - **Admin**: Jurisdictional complaint queues, inspector assignments, priority updates, department tracking, and resolution oversight.
  - **Reviewer**: Assigned complaint queue, on-site assessment form with approval, mandatory reason-backed rejection, and department recommendation logging.
  - **Citizen**: Grievance submission with automated Ticket ID (`ADH-YYYY-XXXXXX`), my complaints timeline history, real-time tracking, in-app notifications, and helpdesk support tickets.
- **⚙️ Complete Complaint Lifecycle Engine**:
  `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `APPROVED` / `REJECTED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`
  - Every status change automatically writes an audit record into `statusHistory` capturing timestamps, action remarks, and actor identities.
- **💰 Departmental Budget Oversight**: Automatic formula-driven calculation of available balance (`allocatedAmount - utilizedAmount = remainingAmount`), burn rates, and scheme management.
- **🔔 Real-Time In-App Notifications**: Alerts citizens and staff upon complaint submission, assignment, inspection review, and final civic resolution.
- **📊 Reports & Data Analytics**: Visual analytics powered by Recharts (Status distributions, Priority breakdown, Monthly trends, Departmental resolution matrix, and Print-to-PDF export).

---

## 🏗️ System Architecture & Technology Stack

```
                                  [ Citizen / Public Browser ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         [ Public Landing / Tracking ]                    [ Unified Login / Register ]
                      │                                               │
                      │                                      (JWT Token Verification)
                      │                                               │
      ┌───────────────┼───────────────┬───────────────┬───────────────┴───────────────┐
      ▼               ▼               ▼               ▼                               ▼
[ Super Admin ]    [ Admin ]    [ Reviewer ]    [ Citizen ]                       (REST API)
  /super-admin      /admin        /reviewer       /citizen                            │
      │               │               │               │                               ▼
      └───────────────┴───────────────┴───────────────┴────────────────────► [ Node / Express Server ]
                                                                             ├── Helmet / CORS / RateLimiter
                                                                             ├── JWT Authentication & RBAC
                                                                             ├── MVC Architecture Controllers
                                                                             └── Mongoose ODM
                                                                                      │
                                                                                      ▼
                                                                             [ MongoDB Database ]
                                                                             ├── users
                                                                             ├── departments
                                                                             ├── complaints
                                                                             ├── reviews
                                                                             ├── budgets
                                                                             ├── supporttickets
                                                                             └── notifications
```

### Technology Specification:
- **Frontend**: React.js (v18), Vite, React Router DOM (v6), Axios, Context API, Lucide React Icons, Bootstrap 5, Recharts, Custom CSS Design System.
- **Backend**: Node.js, Express.js (v4), REST API architecture, MVC structure, Morgan logging, Helmet security headers, Express Rate Limiter.
- **Database**: MongoDB (Local or MongoDB Atlas) managed via Mongoose ODM schemas.
- **Security**: JSON Web Tokens (JWT), bcryptjs password hashing (10 salt rounds), RBAC authorization middleware, parameterized query protection.

---

## 📂 Project Folder Structure

```
last_final_proj/
│
├── client/
│   ├── public/
│   │   └── logo.svg                      # Official Aadhirai Shield Emblem (SVG)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── Logo.jsx              # Reusable vector logo component
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.jsx   # Topbar + Role-aware sidebar layout
│   │   │       ├── DashboardSidebar.jsx  # Dynamic 4-role navigation menu
│   │   │       ├── DashboardTopbar.jsx   # Topbar with unread notifications
│   │   │       ├── PublicFooter.jsx      # Portal footer with helpline info
│   │   │       ├── PublicLayout.jsx      # Public navigation wrapper
│   │   │       └── PublicNavbar.jsx      # Main public header
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Single unified authentication context
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── RegisterPage.jsx      # Citizen registration (Public only)
│   │   │   │   └── UnifiedLoginPage.jsx  # Single unified login for all 4 roles
│   │   │   ├── public/
│   │   │   │   ├── AboutPage.jsx         # System mandate and architecture
│   │   │   │   ├── ContactPage.jsx       # Contact helpline and support
│   │   │   │   ├── LandingPage.jsx       # Public homepage with live stats
│   │   │   │   ├── NotFoundPage.jsx      # 404 handler
│   │   │   │   ├── TrackComplaintPage.jsx# Zero-login complaint lookup
│   │   │   │   └── UnauthorizedPage.jsx  # 403 access control handler
│   │   │   ├── superAdmin/               # Super Admin pages (9 modules)
│   │   │   │   ├── AdminManagement.jsx
│   │   │   │   ├── BudgetManagement.jsx
│   │   │   │   ├── CitizenManagement.jsx
│   │   │   │   ├── ComplaintManagement.jsx
│   │   │   │   ├── DepartmentManagement.jsx
│   │   │   │   ├── ReportsAnalytics.jsx
│   │   │   │   ├── ReviewerManagement.jsx
│   │   │   │   ├── SuperAdminDashboard.jsx
│   │   │   │   └── SuperAdminProfile.jsx
│   │   │   ├── admin/                    # Admin pages (8 modules)
│   │   │   │   ├── AdminBudgets.jsx
│   │   │   │   ├── AdminCitizens.jsx
│   │   │   │   ├── AdminComplaints.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminDepartments.jsx
│   │   │   │   ├── AdminProfile.jsx
│   │   │   │   ├── AdminReports.jsx
│   │   │   │   └── AdminReviewers.jsx
│   │   │   ├── reviewer/                 # Reviewer pages (4 modules)
│   │   │   │   ├── AssignedComplaints.jsx
│   │   │   │   ├── ReviewerDashboard.jsx
│   │   │   │   ├── ReviewerHistory.jsx
│   │   │   │   └── ReviewerProfile.jsx
│   │   │   └── citizen/                  # Citizen pages (7 modules)
│   │   │       ├── CitizenDashboard.jsx
│   │   │       ├── CitizenNotifications.jsx
│   │   │       ├── CitizenProfile.jsx
│   │   │       ├── CitizenSupport.jsx
│   │   │       ├── CitizenTrackComplaint.jsx
│   │   │       ├── MyComplaints.jsx
│   │   │       └── RaiseComplaint.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx        # RBAC route guard
│   │   ├── services/
│   │   │   └── api.js                    # Centralized Axios with Bearer interceptors
│   │   ├── App.jsx                       # Full application routing configuration
│   │   ├── index.css                     # Custom Government-Portal Design System
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vercel.json                       # Vercel SPA rewrites configuration
│   └── vite.config.js
│
├── server/
│   ├── scripts/
│   │   └── seedSuperAdmin.js             # Initial database seeder for all 4 roles
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB connection with error recovery
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── budgetController.js
│   │   │   ├── complaintController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── departmentController.js
│   │   │   ├── notificationController.js
│   │   │   ├── reviewController.js
│   │   │   ├── supportController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js         # JWT verify token
│   │   │   ├── errorMiddleware.js        # Centralized 404 & error handlers
│   │   │   └── roleMiddleware.js         # RBAC authorize(...roles)
│   │   ├── models/
│   │   │   ├── Budget.js
│   │   │   ├── Complaint.js
│   │   │   ├── Department.js
│   │   │   ├── Notification.js
│   │   │   ├── Review.js
│   │   │   ├── SupportTicket.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── departmentRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── supportRoutes.js
│   │   │   └── userRoutes.js
│   │   └── server.js                     # Express app setup and route mounting
│   ├── .env.example
│   └── package.json
│
├── thunder-client/
│   └── aadhirai-thunder-collection.json  # Importable API test suite
├── .gitignore
├── package.json                          # Root workspace runner scripts
└── README.md
```

---

## ⚡ Installation & Execution Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** instance (Local `mongodb://localhost:27017` or a free **MongoDB Atlas** cluster)

### 2. Clone & Install Dependencies
Run the install command from the root directory:
```bash
# Clone the repository
git clone https://github.com/your-username/aadhirai-complaint-management.git
cd aadhirai-complaint-management

# Install root, backend, and frontend dependencies in one step:
npm run install:all
```

Alternatively, install individually:
```bash
# Backend installation
cd server
npm install

# Frontend installation
cd ../client
npm install
```

---

## ⚙️ Environment Configuration

### Backend Environment (`server/.env`):
Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/aadhirai
JWT_SECRET=aadhirai_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(If connecting to MongoDB Atlas, replace `MONGO_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/aadhirai?retryWrites=true&w=majority`)*

### Frontend Environment (`client/.env`):
Create `client/.env` (or copy from `client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Seeding (Out-of-the-Box Setup)

Populate default municipal departments, pre-configured role accounts, and initial complaints data:
```bash
# Run seeder from root
npm run seed

# Or run directly inside server folder:
cd server
npm run seed
```

### 🔑 Pre-Configured Test Credentials:
All accounts can sign in via the **Single Unified Login Page** (`/login`):

| Role | Email Address | Password | Landing Dashboard |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@aadhirai.gov.in` | `SuperAdmin@123` | `/super-admin/dashboard` |
| **Admin** | `admin@aadhirai.gov.in` | `Admin@123` | `/admin/dashboard` |
| **Reviewer** | `reviewer@aadhirai.gov.in` | `Reviewer@123` | `/reviewer/dashboard` |
| **Citizen** | `citizen@aadhirai.gov.in` | `Citizen@123` | `/citizen/dashboard` |

*(Tip: On the `/login` page, you can also use the 1-click **Quick Demo / Evaluator Logins** buttons to automatically fill credentials!)*

---

## 🚀 Running the Application

### Option A: Run Both Concurrently (Recommended)
From the root project folder:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Client**: `http://localhost:5173`
- **Health Check**: `http://localhost:5000/api/health`

### Option B: Run Services Separately
In Terminal 1 (Backend):
```bash
cd server
npm run dev
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

---

## 🧪 REST API Documentation & Thunder Client Testing

An importable collection file is located at:
`thunder-client/aadhirai-thunder-collection.json`

### Key API Endpoints Overview:

| Module | Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Citizen registration only |
| **Auth** | `POST` | `/api/auth/login` | Public | Single unified login for all 4 roles |
| **Auth** | `GET` | `/api/auth/me` | Private | Returns verified profile with populated role |
| **Complaints** | `GET` | `/api/complaints/track/:ticketId` | **Public** | Public instant tracking without login |
| **Complaints** | `POST` | `/api/complaints` | Citizen | Submits grievance with automatic Ticket ID |
| **Complaints** | `GET` | `/api/complaints` | Role-Scoped | Citizen sees own; Reviewer sees assigned; Admin sees all |
| **Complaints** | `PATCH` | `/api/complaints/:id/assign` | Admin, SuperAdmin | Assigns department and field reviewer |
| **Complaints** | `PATCH` | `/api/complaints/:id/status` | Admin, SuperAdmin | Updates workflow status and logs audit remarks |
| **Reviews** | `POST` | `/api/reviews/:complaintId` | Reviewer | Submits on-site inspection decision (Approve/Reject) |
| **Departments**| `GET` | `/api/departments` | Public / Private | Lists active municipal departments |
| **Departments**| `POST` | `/api/departments` | Super Admin | Creates new municipal portfolio |
| **Budgets** | `GET` | `/api/budgets` | Admin, SuperAdmin | Lists budgets with calculated remaining balance |
| **Dashboard** | `GET` | `/api/dashboard/public-stats` | Public | Real-time counts for landing page |
| **Dashboard** | `GET` | `/api/dashboard/super-admin` | Super Admin | Statewide analytics and Recharts datasets |
| **Notifications**| `GET`| `/api/notifications` | Private | User notifications with unread counter |

---

## 🌐 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a free M0 Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user (e.g. `aadhirai_user`) with read/write privileges.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) to permit cloud connections from Render.
4. Copy the SRV URI and set it as `MONGO_URI` in Render.

### 2. Render Deployment (Backend)
1. Push your project to a GitHub repository.
2. Sign in to [Render](https://render.com) and click **New + ➔ Web Service**.
3. Connect your GitHub repository:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_secure_random_string`
   - `CLIENT_URL`: `https://your-aadhirai-frontend.vercel.app`
5. Deploy the service. Your backend URL will be e.g. `https://aadhirai-api.onrender.com`.

### 3. Vercel Deployment (Frontend)
1. Sign in to [Vercel](https://vercel.com) and click **Add New... ➔ Project**.
2. Select your repository:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://aadhirai-api.onrender.com/api`
4. Click **Deploy**. The included `client/vercel.json` ensures all deep routes (`/citizen/dashboard`, `/login`, etc.) route seamlessly through `index.html`.

---

## 📜 Academic Project Verification Checklist

- [x] Strict MERN technology compliance (Zero banned frameworks used).
- [x] Prominent branding: "AADHIRAI – Smart Citizen Complaint Management System" & "Your Voice. Our Responsibility."
- [x] Exactly 4 roles implemented: `SUPER_ADMIN`, `ADMIN`, `REVIEWER`, `CITIZEN`.
- [x] ONE single, unified login page (`/login`) with role-based redirection.
- [x] Citizen-only public registration (`/register`).
- [x] Zero-login public complaint tracking (`/track-complaint`).
- [x] Status transition audit trail with timestamps and remarks.
- [x] Reviewer evaluation flow with mandatory rejection reasons.
- [x] Department and Budget management with formula-driven balance calculations.
- [x] Full responsive UI with government-grade design palette and Recharts.
- [x] Tested production build (`vite build` completed with 0 errors).
- [x] Seed script provided with ready-to-test credentials.
- [x] Thunder Client collection JSON provided.

---

**© 2026 AADHIRAI Team. Developed for Smart Citizen Complaint Redressal.**

