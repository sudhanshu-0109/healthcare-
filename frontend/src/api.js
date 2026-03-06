const BASE = "http://localhost:8000/api";
const ORIGIN = BASE.replace(/\/api\/?$/, "");

async function jsonRequest(method, path, body = null) {
  const opts = { method, headers: {} };
  if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function mapUser(u) {
  if (!u) return u;
  return { id: u.id, name: u.name, email: u.email, password: "", role: u.role, specialty: u.specialty || "" };
}

function mapLabPricing(p) {
  return { id: p.id, testName: p.test_name, price: p.price, lastUpdated: p.last_updated };
}

function mapLabTest(t) {
  return {
    id: t.id,
    patientId: t.patient,
    doctorId: t.doctor,
    testName: t.test_name,
    fixedPrice: t.fixed_price,
    status: t.status,
    reportUrl: t.report_url,
    reportContent: t.report_content || "",
    reportFileUrl:
      t.report_file_url || (t.report_file ? `${ORIGIN}${t.report_file}` : ""),
    patientName: t.patient_name,
    requestedAt: t.requested_at,
  };
}

function mapNotification(n) {
  return {
    id: n.id,
    userId: n.user,
    message: n.message,
    readStatus: n.read_status,
    createdAt: n.created_at,
    type: n.type || "",
  };
}

export const api = {
  async login(email, password) {
    const u = await jsonRequest("POST", "/auth/login/", { email, password });
    return mapUser(u);
  },

  async register({ name, email, password, role, specialty }) {
    const u = await jsonRequest("POST", "/auth/register/", {
      name,
      email,
      password,
      role,
      specialty,
    });
    return mapUser(u);
  },

  async getUsers() {
    const list = await jsonRequest("GET", "/users/");
    return list.map(mapUser);
  },

  async getDoctors() {
    const list = await jsonRequest("GET", "/users/doctors/");
    return list.map(mapUser);
  },

  async getPatients() {
    const list = await jsonRequest("GET", "/users/patients/");
    return list.map(mapUser);
  },

  async getLabPricing() {
    const list = await jsonRequest("GET", "/lab-pricing/");
    return list.map(mapLabPricing);
  },

  async getLabTests() {
    const list = await jsonRequest("GET", "/lab-tests/");
    return list.map(mapLabTest);
  },

  async createLabTest(data) {
    const body = {
      patient: data.patientId,
      doctor: data.doctorId,
      test_name: data.testName,
      fixed_price: data.fixedPrice,
      status: data.status || "PENDING",
      report_url: null,
      patient_name: data.patientName,
      requested_at: data.requestedAt,
    };
    const t = await jsonRequest("POST", "/lab-tests/", body);
    return mapLabTest(t);
  },

  async uploadLabReportPdf(id, file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/lab-tests/${id}/upload-report/`, { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Upload failed");
    }
    const data = await res.json();
    return mapLabTest(data);
  },

  async getNotifications() {
    const list = await jsonRequest("GET", "/notifications/");
    return list.map(mapNotification);
  },

  async getLeaveRequests() {
    return await jsonRequest("GET", "/leave-requests/");
  },

  async createLeaveRequest(data) {
    return await jsonRequest("POST", "/leave-requests/", data);
  },

  async updateLeaveRequest(id, data) {
    return await jsonRequest("PATCH", `/leave-requests/${id}/`, data);
  },

  async createPaymentOrder(amount) {
    return await jsonRequest("POST", "/payments/create_order/", { amount });
  },

  async verifyPayment(data) {
    return await jsonRequest("POST", "/payments/verify_payment/", data);
  },
};

export default api;
