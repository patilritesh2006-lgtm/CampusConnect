# 🎓 CampusConnect — College Event & Student Activity Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **CampusConnect** is a centralized college student activity and event management platform. It streamlines campus life by transforming fragmented event announcements, manual attendance, and paper certificates into a unified system featuring **real-time notifications**, **digital certificates with QR verification**, **gamification achievements**, **interactive calendars**, and **administrative analytics**.

---

## 🚀 Key Features

### 1. 📅 Event Management & Discovery
* **Event Creation & Editing**: Admins can publish events with title, description, venue, date, category, capacity limit, and registration deadlines.
* **Category Filtering**: Explore events by tags: `Hackathon`, `Workshop`, `Seminar`, `Cultural`, `Sports`, and `Conference`.
* **Instant Search**: Search campus events by keyword, title, venue, or status (`Upcoming`, `Ongoing`, `Completed`).

### 2. 📝 Event Registration & Cancellation
* **One-Click Registration**: Students can sign up with automatic duplicate check and capacity limits.
* **Registration Cancellation**: Students can cancel un-attended registrations directly from their dashboard.
* **Registration Roster**: Dedicated attendee lists for each event.

### 3. 📋 Live Attendance Tracking
* **Individual Status Toggle**: Switch student attendance between **Present** and **Absent** in real-time.
* **Bulk Roll Call**: One-click **"Mark All Attended"** button for mass venue check-ins.
* **CSV Export**: Export attendee rosters with full names, departments, attendance status, and certificate codes.
* **Automated Attendance Notifications**: Students receive an instant alert when marked present.

### 4. 📜 Verified Digital Certificates
* **Automated Issuance**: Admins can issue official participation certificates to verified attendees with one click.
* **Unique Credential Identifiers**: Cryptographically sound, collision-free codes (e.g. `CC-2026-A&RE-91D342`).
* **Royal Certificate Template**: High-resolution, gold-bordered certificates with institution headers, authorized signatory seals, and issue dates.
* **Print / PDF Download**: Built-in `@media print` formatting to save or print official certificates directly from the browser.

### 5. 🛡️ Public Certificate Verification Portal
* **Anonymously Accessible**: Public route at `/verify-certificate` and `/verify-certificate/:certificateCode` (no login required).
* **Tamper-Proof Verification**: Instantly verifies the recipient student, event name, venue, event date, issue date, and issuing college.

### 6. 🔔 Real-Time In-App Notifications
* **Navbar Notification Bell**: Unread badge counter with dropdown previews and relative timestamps.
* **Event Triggers**: Instant alerts on attendance confirmation, certificate issuance, new event schedules, and notice broadcasts.
* **Read Status**: Mark individual notifications as read or use "Mark all read".

### 7. 📢 Campus Notice Board & Broadcasts
* **Priority Tagging**: High-visibility notices with priority badges (`Urgent 🚨`, `High ⚠️`, `Normal`).
* **Notice Categories**: Filter notices by `General`, `Important`, `Event`, `Workshop`, and `Competition`.
* **Admin Broadcast Modal**: Admins can broadcast announcements that automatically dispatch notifications to all students.

### 8. 🏆 Student Profile & Gamification Achievements
* **Profile Management**: Update full name, department, year of study, and manage account password.
* **Activity Scoreboard**: Live metrics tracking Total Registered, Total Attended, Total Certificates, and Attendance Rate %.
* **Unlockable Badges**:
  * 🎯 **Active Participant**: Registered for 1+ events.
  * 🚀 **Event Explorer**: Registered for 3+ events.
  * 🥇 **Event Champion**: Attended 3+ events.
  * 📜 **Certified Scholar**: Earned 1+ certificates.
  * ⭐ **Punctual Attendee**: 100% attendance rate.

### 9. 📆 Interactive Event Calendar
* **Monthly Schedule Grid**: Visual calendar with month navigation and quick "Today" jump.
* **Filter Views**: Toggle between "All Campus Events" and "My Registered Events".
* **Event Modals**: Click on any date cell or event chip to view venue, date, and register.

### 10. 📊 Administrative Analytics & Intelligence
* **Key Metrics Summary**: Total Events, Total Students, Registrations, Confirmed Attendees, Certificates Issued, and Overall Attendance Rate %.
* **Department Breakdown**: Visual distribution bars showing student participation per department.
* **Top Popular Events**: Ranked leaderboard tracking popularity by registration and attendance count.
* **Event Lifecycle Distribution**: Breakdown of upcoming, ongoing, completed, and cancelled events.

---

## 🛠️ Tech Stack

### Frontend
* **React 19** with **Vite**
* **Tailwind CSS** for modern UI and responsive layouts
* **React Router v7** for single-page client routing and role-based protection
* **Axios** for API requests with JWT interceptors
* **Lucide React** for UI icons

### Backend
* **Node.js** & **Express** REST API
* **Prisma ORM** for schema modeling and database queries
* **PostgreSQL** relational database
* **JWT (JSON Web Tokens)** for stateless authentication
* **bcrypt** for salted password hashing
* **CORS** & **dotenv** for security configuration

---

## 📂 Project Structure

```text
CampusConnect/
├── backend/
│   ├── config/
│   │   └── prisma.js              # Prisma Client instance
│   ├── controllers/
│   │   ├── analyticsController.js # Admin aggregate intelligence & stats
│   │   ├── announcementController.js # Campus notices & broadcasts
│   │   ├── attendanceController.js   # Single & bulk attendance tracking
│   │   ├── authController.js         # Register, Login & JWT issuance
│   │   ├── certificateController.js  # Certificate generator & verification
│   │   ├── eventController.js        # Event CRUD & attendee roster
│   │   ├── notificationController.js # In-app notification management
│   │   ├── registrationController.js # Registration & cancellation
│   │   ├── studentController.js      # Student list for admin
│   │   └── userController.js         # Profile, badges & password update
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT authentication & role-based gates
│   ├── prisma/
│   │   └── schema.prisma          # Database models (User, Event, Registration, Certificate, Notification, Announcement)
│   ├── routes/                    # Express route routers
│   ├── server.js                  # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             # Axios base instance with auth headers
│   │   ├── components/
│   │   │   ├── AppNavbar.jsx      # Universal responsive navigation bar
│   │   │   ├── NotificationBell.jsx # Live notification popover bell
│   │   │   └── ProtectedRoute.jsx # Role-based route guard
│   │   ├── pages/
│   │   │   ├── AdminAnalytics.jsx     # Visual analytics & department metrics
│   │   │   ├── AdminCertificates.jsx  # Certificate registry & search
│   │   │   ├── AdminDashboard.jsx     # Admin control center
│   │   │   ├── AdminEventStudents.jsx # Attendee roster & attendance switches
│   │   │   ├── AdminStudents.jsx      # Student management table
│   │   │   ├── Announcements.jsx      # Notice board & publishing modal
│   │   │   ├── CalendarView.jsx       # Interactive monthly schedule
│   │   │   ├── CertificateVerify.jsx  # Public certificate verification
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── Login.jsx              # Student registration & dual-role login
│   │   │   ├── MyRegistrations.jsx    # Registration history & certificate claims
│   │   │   ├── StudentCertificates.jsx# Royal printable certificate gallery
│   │   │   ├── StudentDashboard.jsx   # Student activity workspace
│   │   │   ├── StudentEvents.jsx      # Events explorer with category filters
│   │   │   ├── StudentProfile.jsx     # Profile & gamification badge scoreboard
│   │   │   └── NotFound.jsx           # 404 handler
│   │   ├── App.jsx                # Route registry
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
* **Node.js** (v18.x or higher)
* **PostgreSQL** database running locally or via cloud (e.g. Supabase, Neon, Railway)
* **npm** or **yarn**

---

### 1. Backend Setup

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/campusconnect?schema=public"
   JWT_SECRET="your_secure_jwt_secret_key"
   ```

4. Push the Prisma schema to your database and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. Start the backend development server:
   ```bash
   node server.js
   ```
   *The API will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser at `http://localhost:5173`.*

---

## 🔐 Default Login Credentials

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusconnect.com` | `admin123` | Event management, attendance marking, certificate generation, analytics, notice broadcasts. |
| **Student** | `ritesh@gmail.com` *(or create new)* | `123456` | Event registration, certificate viewing/printing, notification alerts, profile & badges scoreboard. |
| **Public Verification** | *(No login required)* | — | Visit `/verify-certificate` to verify any credential code. |

---

## 📡 API Reference Overview

### Authentication & Users
* `POST /api/auth/register` — Register a new student account
* `POST /api/auth/login` — Login as student or admin (returns JWT)
* `GET /api/users/profile` — Get authenticated student details & badge achievements
* `PUT /api/users/profile` — Update student profile info
* `PUT /api/users/change-password` — Change student account password

### Events
* `GET /api/events` — Get all published college events
* `POST /api/events` — Create a new event *(Admin only)*
* `PUT /api/events/:id` — Update event details *(Admin only)*
* `DELETE /api/events/:id` — Delete event *(Admin only)*
* `GET /api/events/:id/students` — Get attendee roster with attendance status *(Admin only)*
* `POST /api/events/:id/register` — Register for an event *(Student only)*

### Attendance & Certificates
* `PUT /api/attendance/:eventId/user/:userId` — Toggle attendance (Present/Absent) *(Admin only)*
* `POST /api/attendance/:eventId/bulk` — Bulk mark attendance *(Admin only)*
* `POST /api/certificates/generate` — Generate digital certificate *(Admin only)*
* `GET /api/certificates/my` — Get student's earned certificates *(Student only)*
* `GET /api/certificates/all` — Get all issued certificates *(Admin only)*
* `GET /api/certificates/verify/:code` — **Public** certificate verification

### Notifications & Announcements
* `GET /api/notifications` — Get in-app notifications & unread count
* `PUT /api/notifications/:id/read` — Mark notification as read
* `PUT /api/notifications/read-all` — Mark all notifications as read
* `GET /api/announcements` — Get all campus notices
* `POST /api/announcements` — Publish notice with student broadcast *(Admin only)*
* `DELETE /api/announcements/:id` — Delete notice *(Admin only)*

### Analytics
* `GET /api/analytics/admin` — Get aggregate metrics, department stats, and top events *(Admin only)*

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).