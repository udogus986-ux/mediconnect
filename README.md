# 🏥 MediConnect — Healthcare Communication Platform

> A modern doctor-patient communication platform built with React, Node.js, MongoDB, Socket.io and deployed on Railway & Vercel.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

---

## ✨ Features

### 🧑‍⚕️ For Patients
- Search and filter doctors by specialty, city and rating
- View doctor profiles with working hours and consultation fees
- Book appointments with real-time availability
- Receive email confirmation when appointment is approved
- Real-time messaging with doctors via Socket.io
- View nearby hospitals and clinics on interactive map (OpenStreetMap + Leaflet)
- Rate doctors after completed appointments (3 categories: Communication, Expertise, Punctuality)
- Password reset via email

### 👨‍⚕️ For Doctors
- Dedicated doctor dashboard with pending appointment management
- Approve or reject appointments (auto-approved after 2 hours)
- Receive email notifications for new appointment requests
- Real-time messaging with patients
- Analytics dashboard with revenue charts and appointment statistics
- Doctors hidden from each other in search results

### 🔐 Auth & Security
- JWT-based authentication
- bcrypt password hashing
- Role-based access control (PATIENT / DOCTOR)
- Email-based password reset with secure tokens
- Google & Facebook OAuth (coming soon)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Mail | Nodemailer (Gmail) |
| Scheduler | node-cron (auto-approval) |
| Map | Leaflet.js + OpenStreetMap |
| Auth | JWT, bcryptjs |
| Deploy | Railway (backend) + Vercel (frontend) |

---

## 📁 Project Structure

```
mediconnect/
├── frontend/                 # React + TypeScript
│   └── src/
│       ├── api/              # Axios API calls
│       ├── components/       # Navbar, ReviewModal, NearbyMap
│       ├── context/          # AuthContext
│       └── pages/            # Landing, Doctors, Dashboard, Chat, Analytics...
│
└── backend/                  # Node.js + Express
    └── src/
        ├── config/           # DB, Mailer, Scheduler
        ├── controllers/      # auth, doctor, appointment, message, review, analytics
        ├── middleware/        # JWT auth, role guard
        ├── models/           # User, Doctor, Appointment, Message, Conversation, Review
        └── routes/           # API routes
```

---

## 🗄️ Database Models

```
User ──── Doctor ──── Appointment ──── Review
  │                        │
  │                   Conversation
  │                        │
  └──── Message ───────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend `.env`:**
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mediconnect
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
MAIL_USER=your@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=MediConnect <your@gmail.com>
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (PATIENT or DOCTOR) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List doctors (filtered) |
| GET | `/api/doctors/:id` | Get doctor profile |
| GET | `/api/doctors/nearby` | Get nearby doctors |
| POST | `/api/doctors` | Create doctor profile |
| PUT | `/api/doctors` | Update doctor profile |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments/my` | Get my appointments |
| PUT | `/api/appointments/:id/status` | Update status (Doctor) |
| PUT | `/api/appointments/:id/cancel` | Cancel (Patient) |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get conversations |
| POST | `/api/messages/conversations` | Start conversation |
| GET | `/api/messages/conversations/:id` | Get messages |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create review |
| GET | `/api/reviews/doctor/:id` | Get doctor reviews |
| GET | `/api/reviews/reviewable` | Get reviewable appointments |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/doctor` | Doctor analytics |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinConversation` | Client → Server | Join chat room |
| `sendMessage` | Client → Server | Send message |
| `newMessage` | Server → Client | Receive message |
| `typing` | Client → Server | Typing indicator |
| `userTyping` | Server → Client | Show typing indicator |
| `userOnline` | Server → Client | User came online |
| `userOffline` | Server → Client | User went offline |

---

## 🎨 Design System

- **Font:** Playfair Display (headings) + Inter (body)
- **Primary:** Teal `#00545e`
- **Secondary:** Soft mint `#d8e5e7`
- **Glass morphism** cards with backdrop blur
- **Material Symbols** icons
- Responsive design

---

## 👤 Author

Built as part of a full stack developer portfolio.

---

## 📄 License

MIT
