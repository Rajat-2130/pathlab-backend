# 🧪 PathLab — Pathology Lab Booking System

A full-stack MERN production-ready application for booking pathology tests online.

---

## 🗂 Project Structure

```
pathlab/
├── pathlab-backend/          # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── reportController.js
│   │   ├── testController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT + role guard
│   │   ├── error.js          # Global error handler
│   │   └── validate.js       # express-validator rules
│   ├── models/
│   │   ├── User.js
│   │   ├── Test.js
│   │   ├── Booking.js
│   │   └── Report.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── testRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── errorHandler.js   # AppError + asyncHandler
│   │   ├── seeder.js         # DB seed script
│   │   └── token.js          # JWT cookie helper
│   ├── uploads/              # Auto-created for reports
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── pathlab-frontend/         # React + Vite + Tailwind
    ├── src/
    │   ├── api/
    │   │   └── index.js      # All Axios API calls
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── BookTestModal.jsx
    │   │   │   ├── ConfirmModal.jsx
    │   │   │   ├── Pagination.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   ├── Spinner.jsx
    │   │   │   ├── StatusBadge.jsx
    │   │   │   └── TestCard.jsx
    │   │   └── layout/
    │   │       ├── AdminLayout.jsx
    │   │       ├── Footer.jsx
    │   │       ├── Layout.jsx
    │   │       ├── Navbar.jsx
    │   │       └── PatientLayout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminBookings.jsx
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminProfile.jsx
    │   │   │   ├── AdminReports.jsx
    │   │   │   ├── AdminTests.jsx
    │   │   │   └── AdminUsers.jsx
    │   │   ├── patient/
    │   │   │   ├── PatientBookings.jsx
    │   │   │   ├── PatientDashboard.jsx
    │   │   │   ├── PatientProfile.jsx
    │   │   │   └── PatientReports.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── NotFound.jsx
    │   │   └── RegisterPage.jsx
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

## 🚀 Setup Instructions

### 1. Clone / Extract the project

```bash
# If using git
git clone <your-repo>
cd pathlab
```

### 2. Backend Setup

```bash
cd pathlab-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pathlab
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min32chars
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@pathlab.com
ADMIN_PASSWORD=Admin@123456
```

**Seed the database** (creates admin, sample patient, and 18 tests):
```bash
npm run seed
```

**Start the backend:**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd pathlab-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

> The Vite proxy forwards `/api/*` requests to `http://localhost:5000` automatically — no CORS issues in dev.

---

## 🔐 Demo Credentials

After running `npm run seed`:

| Role    | Email                    | Password      |
|---------|--------------------------|---------------|
| Admin   | admin@pathlab.com        | Admin@123456  |
| Patient | patient@pathlab.com      | Patient@123   |

---

## 📡 API Reference

### Auth
| Method | Endpoint                   | Access  | Description            |
|--------|----------------------------|---------|------------------------|
| POST   | `/api/auth/register`       | Public  | Register new patient   |
| POST   | `/api/auth/login`          | Public  | Login                  |
| GET    | `/api/auth/logout`         | Private | Logout                 |
| GET    | `/api/auth/me`             | Private | Get current user       |
| PUT    | `/api/auth/profile`        | Private | Update profile         |
| PUT    | `/api/auth/change-password`| Private | Change password        |

### Tests
| Method | Endpoint          | Access | Description        |
|--------|-------------------|--------|--------------------|
| GET    | `/api/tests`      | Public | List all tests     |
| GET    | `/api/tests/:id`  | Public | Get single test    |
| POST   | `/api/tests`      | Admin  | Create test        |
| PUT    | `/api/tests/:id`  | Admin  | Update test        |
| DELETE | `/api/tests/:id`  | Admin  | Delete test        |

### Bookings
| Method | Endpoint                       | Access  | Description          |
|--------|--------------------------------|---------|----------------------|
| POST   | `/api/bookings`                | Patient | Create booking       |
| GET    | `/api/bookings/my`             | Patient | My bookings          |
| GET    | `/api/bookings`                | Admin   | All bookings         |
| GET    | `/api/bookings/:id`            | Private | Single booking       |
| PUT    | `/api/bookings/:id/status`     | Admin   | Update status        |
| PUT    | `/api/bookings/:id/cancel`     | Patient | Cancel booking       |
| GET    | `/api/bookings/stats`          | Admin   | Booking stats        |

### Reports
| Method | Endpoint                           | Access  | Description     |
|--------|------------------------------------|---------|-----------------|
| POST   | `/api/reports/upload/:bookingId`   | Admin   | Upload report   |
| GET    | `/api/reports/:bookingId`          | Private | Get report      |
| DELETE | `/api/reports/:bookingId`          | Admin   | Delete report   |

### Users (Admin)
| Method | Endpoint                   | Access | Description      |
|--------|----------------------------|--------|------------------|
| GET    | `/api/users`               | Admin  | List all users   |
| GET    | `/api/users/:id`           | Admin  | Single user      |
| PUT    | `/api/users/:id/role`      | Admin  | Update role      |
| DELETE | `/api/users/:id`           | Admin  | Delete user      |
| GET    | `/api/users/dashboard-stats` | Admin | Dashboard stats |

---

## 🌟 Features Summary

### Patient
- Register / Login with JWT (HTTP-only cookies)
- Browse & search pathology tests
- Filter by category
- Book tests with date/time slot
- View booking history & status tracking
- Cancel pending bookings
- Download reports when ready
- Update profile & change password

### Admin
- Dashboard with key stats
- Full CRUD for pathology tests
- View and manage all bookings
- Update booking status (Pending → Sample Collected → Report Ready)
- Upload patient reports via URL
- Manage users (view, change role, delete)
- Protected admin routes

---

## 🛡️ Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT stored in **HTTP-only cookies** (XSS safe)
- Role-based access control middleware
- Input validation with **express-validator**
- CORS configured for specific origin
- Error messages don't leak stack traces in production

---

## 🏗️ Production Build

### Frontend
```bash
cd pathlab-frontend
npm run build
# Output: dist/ folder — deploy to Vercel, Netlify, etc.
```

### Backend
```bash
# Set NODE_ENV=production in .env
# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name pathlab-api
```

### MongoDB Atlas (Cloud)
Replace `MONGO_URI` in `.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/pathlab?retryWrites=true&w=majority
```

---

## 📦 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6 |
| State      | Context API                             |
| HTTP       | Axios with proxy                        |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB, Mongoose                       |
| Auth       | JWT, bcryptjs, HTTP-only cookies        |
| Validation | express-validator                       |
| Upload     | Multer (local) + URL-based              |
| Fonts      | Plus Jakarta Sans, Syne (Google Fonts)  |

---

## 📄 License

MIT — free for personal and commercial use.
