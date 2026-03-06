# 🏥 healthcare+

## Transparent Hospital Workflow & Smart Patient Care System

---

## 🧠 Problem Statement

Traditional hospital systems suffer from poor transparency, manual workflows, and lack of real-time coordination.

As a result:
- Patients face billing fraud and hidden charges
- Waiting rooms become overcrowded
- Communication between departments is delayed
- Emergency response systems are inefficient
- Medication adherence is poorly tracked

---

## 🎯 Objective

To build a transparent, automated, and real-time healthcare workflow engine that connects patients, doctors, labs, billing, and emergency services on a single platform.

---

## 🚀 Tech Stack

- **Backend:** Django (REST Framework)
- **Frontend:** React
- **Database:** SQLite
- **API Architecture:** REST APIs

---

## ✨ Core Features

---

### 🔐 1. Authentication & Role Management

- Role-based login:
  - Patient
  - Doctor
  - Lab Assistant
  - Admin
- Secure authentication
- Profile management
- Protected routes

---

### 📅 2. Appointment Booking System

- Search doctors by specialization
- View available time slots
- Book appointments
- Receive booking confirmations
- Role-based appointment dashboards

---

### ⏳ 3. Smart Queue Management

- Doctor defines session time and maximum patient limit
- Automatic queue number assignment
- If session exceeds limit → auto-shift to next session
- Live queue tracking
- Expected consultation time visibility

**Impact:**
- Reduces waiting room crowd
- Reduces staff workload
- Improves scheduling efficiency

---

### 🧪 4. Lab Test Workflow with Transparency

- Doctor assigns lab tests digitally
- Fixed pricing visible to patients
- No hidden charges
- Admin approval required for price changes
- Digital receipts stored permanently
- Lab report upload to patient dashboard
- Instant notification on report availability

**Result:** Prevents billing fraud and increases patient trust.

---

### 💊 5. Digital Prescription & Medicine Reminder System

- Doctor adds prescription digitally
- Dosage and instructions saved in system
- Automatic reminder generation

Example:
- 3 times/day:
  - 8:00 AM
  - 2:00 PM
  - 8:00 PM

- Missed dose tracking
- Reminder notifications

---

### 💰 6. Billing Transparency Module

- Complete breakdown of:
  - Consultation fees
  - Lab charges
  - Pharmacy charges
- Secure invoice history
- Standard vs billed comparison
- Price locking mechanism
- Fraud prevention logic

---

### 🚑 7. Emergency Ambulance System (FCFS Model)

- Emergency button available even before login
- User holds button for 3 seconds to trigger
- Automatic GPS location fetch
- Nearby hospitals notified
- First hospital to accept gets assignment (FCFS)
- Ambulance dispatched immediately
- Real-time status updates

**Goal:** Faster and automated emergency response.

---

### 🔔 8. Real-Time Notifications

Patients receive updates for:
- Appointment bookings
- Queue movement
- Lab test status
- Report uploads
- Billing updates
- Prescription changes
- Emergency response events

  
  ## 📂 Project Structure

```
HEALTH/
│
├── backend/
│   ├── api/
│   ├── config/
│   ├── media/
│   ├── venv/
│   ├── db.sqlite3
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── node_modules/
│   ├── src/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
│
├── node_modules/
├── public/
├── src/
├── .gitignore
└── README.md
```