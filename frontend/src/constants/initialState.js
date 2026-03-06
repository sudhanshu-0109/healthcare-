// ─── INITIAL STATE ────────────────────────────────────────────
// Seed data for the entire application. In production this would
// come from the backend API on first load.

export const INITIAL_STATE = {
    currentUser: null,
    view: "landing", // landing | app

    users: [
        { id: 1, name: "Dr. Priya Mehta", email: "priya@hplus.com", password: "123", role: "doctor", specialty: "General Medicine" },
        { id: 2, name: "Dr. Arjun Sharma", email: "arjun@hplus.com", password: "123", role: "doctor", specialty: "Cardiology" },
        { id: 3, name: "Rohan Patel", email: "rohan@hplus.com", password: "123", role: "patient" },
        { id: 4, name: "Sneha Iyer", email: "sneha@hplus.com", password: "123", role: "patient" },
        { id: 5, name: "Lab Tech Vikram", email: "vikram@hplus.com", password: "123", role: "lab" },
        { id: 6, name: "Admin Anita", email: "anita@hplus.com", password: "123", role: "admin" },
        { id: 7, name: "City General Hosp.", email: "city@hplus.com", password: "123", role: "hospital" },
        { id: 8, name: "Pharmex Ravi", email: "ravi@hplus.com", password: "123", role: "pharmacy" },
    ],

    appointments: [
        { id: 1, patientId: 3, doctorId: 1, date: "2026-03-01", time: "10:00 AM", status: "CONFIRMED", queueNumber: 1, patientName: "Rohan Patel", doctorName: "Dr. Priya Mehta" },
        { id: 2, patientId: 4, doctorId: 1, date: "2026-03-01", time: "10:30 AM", status: "PENDING", queueNumber: 2, patientName: "Sneha Iyer", doctorName: "Dr. Priya Mehta" },
        { id: 3, patientId: 3, doctorId: 2, date: "2026-02-28", time: "02:00 PM", status: "COMPLETED", queueNumber: 1, patientName: "Rohan Patel", doctorName: "Dr. Arjun Sharma" },
    ],

    prescriptions: [
        {
            id: 1, patientId: 3, doctorId: 2, diagnosis: "Hypertension - Stage 1", createdAt: "2026-02-28",
            patientName: "Rohan Patel", doctorName: "Dr. Arjun Sharma",
            medicines: [
                { id: 1, name: "Amlodipine", dosagePerDay: "1", durationDays: 30, instructions: "After breakfast" },
                { id: 2, name: "Losartan", dosagePerDay: "1", durationDays: 30, instructions: "After dinner" },
            ],
        },
    ],

    labTests: [
        { id: 1, patientId: 3, doctorId: 2, testName: "Complete Blood Count", fixedPrice: 350, status: "COMPLETED", reportUrl: "#", patientName: "Rohan Patel", requestedAt: "2026-02-28" },
        { id: 2, patientId: 4, doctorId: 1, testName: "Lipid Profile", fixedPrice: 680, status: "PENDING", reportUrl: null, patientName: "Sneha Iyer", requestedAt: "2026-03-01" },
    ],

    labPricing: [
        { id: 1, testName: "Complete Blood Count", price: 350, lastUpdated: "2026-02-01" },
        { id: 2, testName: "Lipid Profile", price: 680, lastUpdated: "2026-02-01" },
        { id: 3, testName: "Blood Sugar (Fasting)", price: 120, lastUpdated: "2026-02-01" },
        { id: 4, testName: "Thyroid Profile (TSH)", price: 950, lastUpdated: "2026-02-01" },
        { id: 5, testName: "Liver Function Test", price: 780, lastUpdated: "2026-02-01" },
        { id: 6, testName: "Urine Routine", price: 150, lastUpdated: "2026-02-01" },
        { id: 7, testName: "ECG", price: 250, lastUpdated: "2026-02-01" },
        { id: 8, testName: "Chest X-Ray", price: 500, lastUpdated: "2026-02-01" },
    ],

    billing: [
        {
            id: 1, patientId: 3, consultationFee: 500, labFee: 350, pharmacyFee: 280, totalAmount: 1130,
            paidStatus: true, createdAt: "2026-02-28", receiptId: "HP-RCP-001", verifiedBadge: true,
        },
    ],

    emergencyRequests: [
        { id: 1, patientId: 3, location: "Sector 12, Vadodara", status: "COMPLETED", acceptedHospitalId: 7, createdAt: "2026-02-27", eta: "8 mins" },
    ],

    pharmacyOrders: [
        {
            id: 1, patientId: 3, prescriptionId: 1, status: "READY", generatedAt: "2026-02-28",
            items: [
                { name: "Amlodipine 5mg", qty: 30, unitPrice: 6 },
                { name: "Losartan 50mg", qty: 30, unitPrice: 8 },
            ],
            totalAmount: 280, pickedUp: false, remindersActive: true,
        },
    ],

    auditLogs: [
        { id: 1, action: "PRICE_UPDATE", performedBy: "Admin Anita", detail: "CBC updated to ₹350", timestamp: "2026-02-01" },
        { id: 2, action: "USER_LOGIN", performedBy: "Rohan Patel", detail: "Patient login", timestamp: "2026-03-01" },
    ],

    notifications: [
        { id: 1, userId: 3, message: "Appointment with Dr. Priya Mehta confirmed for March 1 at 10:00 AM", readStatus: false, createdAt: "2026-02-28", type: "appointment" },
        { id: 2, userId: 3, message: "Lab report for Complete Blood Count is ready. View now.", readStatus: false, createdAt: "2026-02-28", type: "lab" },
        { id: 3, userId: 3, message: "Bill of ₹1130 generated. All charges are transparent.", readStatus: true, createdAt: "2026-02-28", type: "billing" },
        { id: 4, userId: 3, message: "Reminder: Take Amlodipine after breakfast today", readStatus: false, createdAt: "2026-03-01", type: "medicine" },
        { id: 5, userId: 1, message: "New patient Sneha Iyer booked appointment for March 1", readStatus: false, createdAt: "2026-03-01", type: "appointment" },
        { id: 6, userId: 8, message: "New prescription ready for dispensing – Rohan Patel", readStatus: false, createdAt: "2026-02-28", type: "pharmacy" },
    ],

    // Leave requests (doctor / lab)
    leaveRequests: [],

    // Doctor session limits (doctorId → max patients/day)
    sessionLimits: { 1: 20, 2: 15 },

    // Auto-increment ID counters
    apptNextId: 4,
    labNextId: 3,
    notifNextId: 7,
    emergNextId: 2,
    billNextId: 2,
    presNextId: 2,
    auditNextId: 3,
    pharmNextId: 2,
};
