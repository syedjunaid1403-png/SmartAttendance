# Smart Attendance Analytics System

A modern, professional full-stack attendance management and analytics dashboard designed with clean UX/UX, smooth transitions, and a dark/light mode toggle. 

The application is structured with a modular React.js frontend (powered by Vite, Tailwind CSS, Recharts, and Framer Motion) and a Node.js + Express backend (powered by MongoDB and Mongoose). 

> **Note for Quick Evaluation:** To ensure the system runs immediately out of the box, the backend includes an **automatic database failover**. If MongoDB is not running locally or `USE_MOCK_DB=true` is set, the system will seamlessly fall back to an in-memory/JSON-file store pre-seeded with 10 students, 2 default users, and 30 days of rich daily attendance history so that all analytics charts and dashboards are fully interactive right away.

---

## Features

### 1. Roster & Student Management
* ** Roster CRUD:** Administrators can add, view, edit, and delete student profiles.
* **Roster Search & Filters:** Search students by name or ID and filter by academic department.
* **Fields:** Tracks student name, student ID, email address, department, and registration date.

### 2. Daily Attendance Logging
* **Marking Sheets:** Mark student presence (Present/Absent) on any selected date.
* **Context Logs:** Add optional remarks to individual records (e.g., late arrival, medical leave).
* **Automatic Defaults:** Defaults student list to "Present" for rapid marking.

### 3. Role-Based Portals & Auth
* **JWT Authentication:** Secure user authentication with JSON Web Tokens.
* **Admin Role:** Grants access to user rosters, daily marking sheets, reporting, and full analytics.
* **Student Role:** Logs students into a personal attendance calendar and summary rates.
* **Testing Panel:** Includes quick credentials fill buttons on the login screen for evaluation.

### 4. Advanced Analytics & Compliance
* **Dashboard KPIs:** Total students, today's attendance rate, overall average, and absent student count.
* **Interactive Recharts:**
  - Daily trend line showing rates for the last 15 days.
  - Overall present vs. absent status share pie chart.
  - Monthly attendance bar charts.
  - Department breakdown progress bars.
* **Risk Compliance Alerts:** Real-time list of students whose overall attendance rate is below 75%.

### 5. Custom Reports Center
* **Parameter Filters:** Compile report rows filtered by department, individual student, start date, and end date.
* **Summary Stats:** Review average attendance rates and counts for queried lists.
* **Spreadsheet Downloader:** Download the compiled table directly as a formatted `.csv` file.

---

## Tech Stack

* **Frontend:**
  - **Framework:** React.js (Vite)
  - **Styling:** Tailwind CSS (Dark/Light mode support)
  - **Animations:** Framer Motion (page slides, spring menus, alert bounces)
  - **Visualizations:** Recharts (Line, Bar, Pie, and Radar Charts)
  - **Icons:** Lucide React
  - **HTTP Client:** Axios (automatic request header JWT injection)
* **Backend:**
  - **Runtime:** Node.js
  - **Framework:** Express.js
  - **Database:** MongoDB (via Mongoose ODM) with fallback JSON memory store.
  - **Authentication:** JWT, bcryptjs

---

## Project Structure

```text
SmartAttendance/
├── backend/
│   ├── config/             # DB connector and JSON failover store
│   ├── controllers/        # Express controllers (auth, student, attendance, analytics)
│   ├── middleware/         # Token validation and role guards
│   ├── models/             # Mongoose schemas (User, Student, Attendance)
│   ├── routes/             # API routes definitions
│   ├── package.json        # Backend configuration
│   └── server.js           # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, Sidebar, Navbar, StatCard, etc.
│   │   ├── context/        # Session, Theme, and Toast Providers
│   │   ├── pages/          # Landing, Login, Dashboard, Student, Attendance, Analytics, Reports
│   │   ├── utils/          # Axios API configuration
│   │   ├── main.jsx        # React mounting entry point
│   │   └── App.jsx         # Routes definition
│   ├── index.html          # HTML entry point
│   ├── tailwind.config.js  # Tailwind selectors & themes config
│   ├── postcss.config.js   # CSS compiler config
│   └── package.json        # Frontend configuration
├── screenshots/            # UI Mockup screenshots
└── README.md               # Setup and guides documentation
```

---

## Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) installed (v18+ recommended)
* [MongoDB](https://www.mongodb.com/) (Optional - if offline, the system boots in memory database mode automatically)

### Step 1: Clone or Open the Directory
Open a terminal in the root `SmartAttendance` folder.

### Step 2: Install Dependencies

**For the Backend API:**
```bash
cd backend
npm install
```

**For the Frontend Client:**
```bash
cd ../frontend
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` is used to bypass React 19 peer dependencies on charts library).*

### Step 3: Configure Environment Variables
A `.env` configuration file has been pre-created in the `backend/` folder:
```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_attendance
JWT_SECRET=super_secret_smart_attendance_key_98765
USE_MOCK_DB=false
```
*If you wish to force the in-memory fallback without starting MongoDB, you can change `USE_MOCK_DB=false` to `USE_MOCK_DB=true`.*

---

## How to Run the Project

You can run and open the application in three different ways:

### Option A: Open index.html Directly (No Server Needed)
Since the production build of the React app has been compiled with relative asset paths and client-side hash routing, you can open the interface immediately:
1. Navigate to the `frontend/dist/` directory.
2. Double-click the [index.html](file:///c:/Users/zubai/OneDrive/Desktop/SmartAttendance/frontend/dist/index.html) file to open it directly in any web browser.
*(Note: Standalone mode communicates with the backend API on localhost:5000. Start the backend API to perform database actions).*

### Option B: Run Express Backend (Serves index.html Automatically)
The Express backend is configured to serve the built static React client directly. This means you only need to run the backend to launch the full application:
1. Make sure the production assets are built in the frontend folder (`npm run build`). This is already pre-built for you.
2. Navigate to the `backend/` folder and run:
   ```bash
   npm start
   ```
3. Open your browser and navigate to **`http://localhost:5000/`**. The system will serve `index.html` automatically!

### Option C: Run Dev Servers (Standard Development Setup)
To run frontend and backend simultaneously in hot-reloading development mode:
1. In one terminal, start the backend API:
   ```bash
   cd backend
   npm run dev
   ```
2. In a second terminal, start the Vite dev server:
   ```bash
   cd frontend
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

---

## Credentials for Testing
You can use the quick credentials fill buttons on the Login page or enter them manually:

* **Administrator Account:**
  - Email: `admin@smartattendance.com`
  - Password: `admin123`
* **Student Account:**
  - Email: `john@smartattendance.com`
  - Password: `student123`
