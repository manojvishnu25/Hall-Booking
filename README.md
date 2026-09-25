# 🏛️ Jai Shriram Engineering College
## Centralized Hall & Auditorium Booking System

A full-stack enterprise web application specifically built for **Jai Shriram Engineering College** to manage and streamline the booking and real-time usage of **Auditoriums**, **Seminar Halls**, and **Conference Halls**.

---

## 🌟 Key Features

1. **Role-Based Access Control**:
   - **Super Admin**: Manage halls (add/edit/delete/status/capacity), manage departments & credentials, approve/cancel bookings, view system statistics, and export PDF/CSV reports.
   - **Department User**: Unique department login (`AIDS001`, `CSE001`, `ECE001`, etc.), check real-time availability, book halls with participant capacity validation, manage department booking history.
   - **Public / College User**: Public live availability dashboard, current & upcoming event cards, daily timeline schedule, and visual calendar view (no login required).

2. **Strict Double Booking Prevention**:
   - Enforced at both **Frontend UI** (instant pre-submission check) and **Backend Database Layer** (atomic SQL conflict queries).
   - Strict time boundary math (`start_time < existing.end_time AND end_time > existing.start_time`).
   - Supports adjacent non-overlapping times (e.g. 10:00–12:00 and 12:00–14:00 are allowed; 10:00–12:00 and 11:30–13:00 are rejected).

3. **Real-Time Live Updates**:
   - Powered by **Socket.IO**. When any department books or cancels a hall, all active public and admin dashboards automatically update without page refresh.

4. **Visual Schedule & Google Calendar Matrix**:
   - Interactive timetable showing hall allocations across hours (08:00 AM – 08:00 PM) with event preview modals.

5. **Reporting & Data Export**:
   - Export official hall usage registers directly to **PDF** (via `jspdf-autotable`) and **CSV**.

---

## 🔑 Pre-Seeded Demo Login Credentials

### A. Super Admin
- **Username**: `admin`
- **Password**: `admin123`

### B. Department Users
- **AI&DS Department**: `AIDS001` / `dept123`
- **CSE Department**: `CSE001` / `dept123`
- **ECE Department**: `ECE001` / `dept123`
- **EEE Department**: `EEE001` / `dept123`
- **Mechanical Department**: `MECH001` / `dept123`
- **Civil Department**: `CIVIL001` / `dept123`
- **MBA Department**: `MBA001` / `dept123`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher installed on your system.

### Running the Application

1. **Backend API Server**:
   ```bash
   cd backend
   npm install
   npm run seed  # Seed initial admin, departments, halls & sample bookings
   npm start     # Runs Express + Socket.IO server on http://localhost:5000
   ```

2. **Frontend React App**:
   ```bash
   cd frontend
   npm install
   npm run dev   # Runs Vite development server on http://localhost:3000
   ```

3. Open **`http://localhost:3000`** in your browser.

---

## 📁 Directory Structure

```text
confrence hall/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database engine & SQL semantics
│   ├── controllers/
│   │   ├── authController.js     # Admin & Dept authentication
│   │   ├── departmentController.js # Dept management
│   │   ├── hallController.js       # Hall management & availability
│   │   ├── bookingController.js    # Double booking validation & conflict checks
│   │   └── reportController.js     # Analytics & PDF/CSV export
│   ├── routes/                   # REST API routes
│   ├── seed/
│   │   └── seedData.js           # Demo database seeder
│   └── server.js                 # Express + Socket.IO server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Layout, Glassmorphism Cards
│   │   ├── context/              # AuthContext & SocketContext
│   │   ├── pages/
│   │   │   ├── public/           # Public Dashboard, Today's Schedule, Calendar View
│   │   │   ├── dept/             # Dept Dashboard, Book Hall Portal
│   │   │   ├── admin/            # Super Admin Console
│   │   │   └── auth/             # Dept & Admin Login pages
│   │   ├── services/api.js       # Axios HTTP client
│   │   ├── App.jsx               # React Router & Role Guards
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 🛠️ API Reference

- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/department/login` - Department login
- `GET /api/halls/availability?date=YYYY-MM-DD` - Live hall status & availability
- `GET /api/bookings/check-conflict` - Real-time conflict validation
- `POST /api/bookings` - Submit hall booking (Requires Auth)
- `GET /api/reports/stats` - System overview stats
- `GET /api/reports/export/csv` - Download CSV register
