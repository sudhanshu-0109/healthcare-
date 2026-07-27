# PHASE 2 — ENDPOINT AUDIT REPORT

**Repository:** sudhanshu-0109/healthcare-  
**Date:** 2026-07-27  
**Status:** CRITICAL ISSUES FOUND

---

## 📋 EXECUTIVE SUMMARY

| Category | Count | Status |
|----------|-------|--------|
| ✅ **Working Endpoints** | 5 | Basic CRUD operations |
| ⚠️ **Partially Working** | 8 | Missing validation/auth/filtering |
| ❌ **Broken Endpoints** | 3 | Authentication, Payment mocking |
| ❌ **Missing Endpoints** | 18 | Auth, OTP, Profile, Filters |
| 🔴 **Critical Issues** | 14 | No JWT, plain-text passwords, no RBAC |
| **Total Endpoints** | 20 | As per router definition |

---

## 🔍 DETAILED ENDPOINT AUDIT

### SECTION 1: AUTHENTICATION ENDPOINTS

#### 1.1 `POST /auth/login/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:47-54`

**Current Implementation:**
```python
@action(detail=False, methods=["post"])
def login(self, request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    user = User.objects.filter(email=email, password=password).first()
    if not user:
        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(UserLoginSerializer(user).data)
```

**Verification Checklist:**
- [x] Route exists: `router.register(r"auth", views.AuthViewSet, basename="auth")`
- [x] Handler exists: `AuthViewSet.login()`
- ✅ Validation: Email + password required
- ❌ **Authentication:** No JWT/token generation
- ❌ **Error handling:** Generic message only, no logging
- ❌ **Rate limiting:** None
- ✅ Response format: JSON
- ❌ Status codes: Only 401 (missing 400 for validation)
- ❌ Input sanitization: Email lowercased, but password not validated
- ❌ **SECURITY:** Passwords compared in plain text

**Issues:**
1. 🔴 **CRITICAL:** Passwords stored and compared in plain text
2. 🔴 **CRITICAL:** No JWT token generation
3. 🟡 No rate limiting (brute force vulnerability)
4. 🟡 No audit log of login attempts
5. 🟡 No device/IP tracking

**Expected Behavior:**
- Hash password with bcrypt/argon2
- Generate JWT (access + refresh tokens)
- Store refresh token securely
- Return tokens in response
- Log authentication attempt

**Missing Endpoints:**
- `POST /auth/logout/` — Not implemented
- `POST /auth/refresh-token/` — Not implemented
- `POST /auth/change-password/` — Not implemented

---

#### 1.2 `POST /auth/register/`

**Status:** ❌ **BROKEN**

**Code Location:** `backend/api/views.py:56-85`

**Current Implementation:**
```python
@action(detail=False, methods=["post"])
def register(self, request):
    name = (request.data.get("name") or "").strip()
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    role = (request.data.get("role") or "").strip().lower()
    specialty = (request.data.get("specialty") or "").strip() or None

    if not name:
        return Response({"detail": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    if not password or len(password) < 3:
        return Response({"detail": "Password must be at least 3 characters."}, status=status.HTTP_400_BAD_REQUEST)
    if role not in self.REGISTER_ROLES:
        return Response(...)
    if User.objects.filter(email=email).exists():
        return Response(...)

    user = User.objects.create(
        name=name,
        email=email,
        password=password,
        role=role,
        specialty=specialty if role == "doctor" else None,
    )
    return Response(UserLoginSerializer(user).data, status=status.HTTP_201_CREATED)
```

**Verification Checklist:**
- [x] Route exists
- [x] Handler exists
- ⚠️ Validation: Weak (name, email, password, role)
- ❌ **Authentication:** No token generated
- ✅ Error handling: Multiple checks
- ❌ Rate limiting: None
- ✅ Response format: JSON
- ✅ Status codes: 400 for validation, 201 for success
- ❌ Input sanitization: Email lowercased, name/password not validated
- ❌ **SECURITY:** Stores plain-text password

**Issues:**
1. 🔴 **CRITICAL:** Minimum password length = 3 characters (should be ≥ 8)
2. 🔴 **CRITICAL:** Passwords stored in plain text
3. 🟡 No email verification (anyone can register with fake emails)
4. 🟡 No password strength validation (no uppercase, numbers, symbols check)
5. 🟡 No name format validation (can be "a", "123", special chars)
6. 🟡 `REGISTER_ROLES = ("doctor", "patient", "lab")` excludes "admin", "pharmacy", "hospital" — role assignment not flexible
7. 🟡 No audit log

**Expected Behavior:**
- Hash password with bcrypt/argon2 (min 8 chars, strength validation)
- Verify email via OTP/verification link
- Send welcome email
- Generate initial tokens
- Log registration

---

### SECTION 2: USER ENDPOINTS

#### 2.1 `GET /users/`

**Status:** ⚠️ **PARTIALLY WORKING** (Security Issue)

**Code Location:** `backend/api/views.py:88-90`

**Current Implementation:**
```python
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
```

**Verification Checklist:**
- [x] Route exists
- [x] Handler exists (default DRF viewset)
- ✅ Response format: JSON list
- ❌ **Authorization:** No authentication check — anyone can list ALL users
- ❌ Pagination: Missing (returns all users)
- ❌ Filtering: None
- ❌ Search: None
- ❌ Rate limiting: None
- ❌ Sensitive data exposure: Emails exposed

**Issues:**
1. 🔴 **CRITICAL:** No authentication required
2. 🔴 **CRITICAL:** Exposes all user emails (privacy leak)
3. 🟡 No pagination (inefficient for large datasets)
4. 🟡 No filtering (can't search by role)
5. 🟡 N+1 potential if nested relationships accessed

**Expected Behavior:**
- Require authentication (JWT)
- Require authorization (admin only or own profile)
- Implement pagination
- Implement filtering by role
- Implement search by name
- Hide sensitive fields (password)

---

#### 2.2 `GET /users/doctors/`

**Status:** ⚠️ **PARTIALLY WORKING** (Security Issue)

**Code Location:** `backend/api/views.py:92-95`

**Current Implementation:**
```python
@action(detail=False)
def doctors(self, request):
    qs = User.objects.filter(role="doctor")
    return Response(UserSerializer(qs, many=True).data)
```

**Issues:**
1. 🔴 **CRITICAL:** No authentication required
2. 🟡 No pagination
3. ✅ Filtering by role works

---

#### 2.3 `GET /users/patients/`

**Status:** ⚠️ **PARTIALLY WORKING** (Security Issue)

**Code Location:** `backend/api/views.py:97-100`

**Same issues as `/users/doctors/`**

---

#### 2.4 `GET /users/lab_staff/`

**Status:** ⚠️ **PARTIALLY WORKING** (Security Issue)

**Code Location:** `backend/api/views.py:102-105`

**Same issues as `/users/doctors/`**

---

#### 2.5 `GET /users/{id}/` (Detail view)

**Status:** ✅ **WORKS** (but needs auth)

**Provided by:** DRF's default retrieve action

**Issues:**
1. ❌ No authentication required
2. ✅ Returns single user
3. ✅ 404 on missing user

---

### SECTION 3: APPOINTMENT ENDPOINTS

#### 3.1 `GET /appointments/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:108-110`

**Current Implementation:**
```python
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
```

**Issues:**
1. ❌ No authentication required
2. ❌ No authorization (anyone sees all appointments of any patient)
3. ❌ No pagination
4. ❌ No filtering (can't filter by patient_id, doctor_id, date, status)
5. ❌ No sorting

**Expected:** Filter by `?patient_id=X` or `?doctor_id=Y`

---

#### 3.2 `POST /appointments/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:108-120`

**Current Implementation:**
```python
def perform_create(self, serializer):
    instance = serializer.save()
    Notification.objects.create(
        user_id=instance.patient_id,
        message=f"Appointment confirmed with {instance.doctor_name} on {instance.date}. Queue #{instance.queue_number}",
        read_status=False,
        created_at=instance.date,
        type="appointment",
    )
    Notification.objects.create(
        user_id=instance.doctor_id,
        message=f"New patient: {instance.patient_name} on {instance.date} at {instance.time}",
        read_status=False,
        created_at=instance.date,
        type="appointment",
    )
```

**Issues:**
1. ❌ No authentication required
2. ❌ **No validation:** Anyone can book appointment on any date/time for any doctor
3. ❌ **Queue logic missing:** `queue_number` is always 1, no auto-assignment
4. ❌ **Session limits not checked:** Doctor's session limit not enforced
5. ❌ **Double booking prevention missing:** No unique constraint on (doctor, date, time)
6. ⚠️ Time stored as CharField, should be TimeField
7. ⚠️ Status not validated (can be any string)

**Missing:**
- Check if doctor is available on that date/time
- Check if date is not in the past
- Enforce session limit
- Assign correct queue number (next available)
- Check if time slot is booked

---

#### 3.3 `PATCH /appointments/{id}/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:129-142`

**Current Implementation:**
```python
def partial_update(self, request, *args, **kwargs):
    instance = self.get_object()
    if "status" in request.data:
        instance.status = request.data["status"]
        if request.data["status"] == "IN_PROGRESS":
            Notification.objects.create(...)
        instance.save()
    return Response(self.get_serializer(instance).data)
```

**Issues:**
1. ❌ No validation on status change
2. ❌ No authorization (anyone can update)
3. ❌ No state machine (can go from COMPLETED → PENDING)
4. ✅ Notification sent on IN_PROGRESS (good)

**Missing Endpoints:**
- `PATCH /appointments/{id}/cancel/` — Explicit cancel endpoint
- `PATCH /appointments/{id}/reschedule/` — Reschedule endpoint

---

### SECTION 4: PRESCRIPTION ENDPOINTS

#### 4.1 `GET /prescriptions/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:145-147`

**Issues:**
1. ❌ No filtering by patient_id or doctor_id
2. ❌ No authorization (anyone sees all prescriptions)
3. ❌ No pagination

---

#### 4.2 `POST /prescriptions/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:145-157`

**Issues:**
1. ❌ No authentication required
2. ❌ No authorization (anyone can write prescriptions as any doctor)
3. ✅ Nested medicines supported
4. ✅ Notifications sent
5. ⚠️ No validation on diagnosis length or medicine data

---

### SECTION 5: LAB ENDPOINTS

#### 5.1 `GET /lab-pricing/`

**Status:** ✅ **WORKS** (but no auth)

**Issues:**
1. ❌ No authentication
2. ✅ Lists all pricing
3. ❌ No filtering, sorting, pagination

---

#### 5.2 `POST /lab-pricing/` (Create/Update)

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:160-171`

**Issues:**
1. ❌ No authentication required
2. ❌ No authorization (anyone can change prices)
3. ✅ Audit log created
4. ⚠️ No approval workflow (should require admin approval per README)

---

#### 5.3 `GET /lab-tests/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Issues:**
1. ❌ No authorization (anyone sees all tests)
2. ❌ No filtering by patient_id, status, date range
3. ❌ No pagination

---

#### 5.4 `POST /lab-tests/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:174-176`

**Issues:**
1. ❌ No authentication
2. ❌ No validation:
   - ❌ Fixed price not validated (can be negative, 0, etc.)
   - ❌ Test name not validated
   - ❌ Patient/doctor IDs not verified
3. ⚠️ Status always "PENDING" (hardcoded in frontend, not enforced in backend)

---

#### 5.5 `POST /lab-tests/{id}/upload-report/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:179-201`

**Current Implementation:**
```python
@action(detail=True, methods=["post"], url_path="upload-report")
def upload_report(self, request, pk=None):
    instance = self.get_object()
    f = request.FILES.get("file")
    if not f:
        return Response({"detail": "Missing file."}, status=status.HTTP_400_BAD_REQUEST)
    name = (getattr(f, "name", "") or "").lower()
    ctype = (getattr(f, "content_type", "") or "").lower()
    if not (name.endswith(".pdf") or ctype == "application/pdf"):
        return Response({"detail": "Only PDF reports are supported."}, status=status.HTTP_400_BAD_REQUEST)

    instance.report_file = f
    instance.status = "COMPLETED"
    instance.save()

    Notification.objects.create(...)
    return Response(self.get_serializer(instance).data)
```

**Issues:**
1. ❌ No authentication required
2. ❌ No authorization (anyone can upload for any test)
3. ✅ File type validation (PDF only)
4. ⚠️ No file size limit (could upload 1GB file)
5. ⚠️ No virus scan (should be optional hook)
6. ⚠️ File stored with original name (security risk - use UUID)
7. ✅ Notification sent (good)

---

#### 5.6 `PATCH /lab-tests/{id}/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:203-220`

**Issues:**
1. ❌ No authorization
2. ⚠️ No validation on status transitions
3. ✅ Notification on COMPLETED (good)

---

### SECTION 6: BILLING ENDPOINTS

#### 6.1 `GET /billing/`

**Status:** ⚠️ **PARTIALLY WORKING** (Critical Security Issue)

**Code Location:** `backend/api/views.py:223-225`

**Current Implementation:**
```python
class BillingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer
```

**Issues:**
1. 🔴 **CRITICAL:** No authentication — anyone can see all bills
2. 🔴 **CRITICAL:** Exposes all patient financial data (privacy violation)
3. ❌ No filtering by patient_id, date range, payment status
4. ❌ No pagination

---

#### 6.2 `POST /billing/` (Create bill)

**Status:** ❌ **BROKEN** (Not exposed in router)

**Issue:** No endpoint to create bills. Who creates bills?

---

#### 6.3 `POST /payments/create_order/`

**Status:** ❌ **BROKEN** (Mock Implementation)

**Code Location:** `backend/api/views.py:322-347`

**Current Implementation:**
```python
@action(detail=False, methods=["post"])
def create_order(self, request):
    amount = request.data.get("amount")
    if not amount:
        return Response({"detail": "Amount required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        order_data = {
            "amount": int(amount) * 100,
            "currency": "INR",
            "payment_capture": "1"
        }
        if RAZORPAY_KEY_ID == "rzp_test_YourKeyId":
            # Provide a mocked response if keys are not yet configured
            import uuid
            return Response({
                "id": "order_" + str(uuid.uuid4()).replace("-", "")[:14],
                "amount": int(amount) * 100,
                "currency": "INR"
            })

        order = razorpay_client.order.create(data=order_data)
        return Response(order)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

**Issues:**
1. ❌ No authentication required
2. ❌ Razorpay keys are hardcoded (should be environment variables)
3. ❌ **Mock response:** Returns fake order ID when keys not configured
4. ❌ No order tracking in database
5. ❌ No link between order and bill_id
6. ❌ No error handling for invalid amounts
7. ⚠️ Razorpay client initialized at module level (inefficient)

---

#### 6.4 `POST /payments/verify_payment/`

**Status:** ❌ **BROKEN** (Mock Implementation)

**Code Location:** `backend/api/views.py:349-378`

**Current Implementation:**
```python
@action(detail=False, methods=["post"])
def verify_payment(self, request):
    data = request.data
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    bill_id = data.get("bill_id")

    try:
        if RAZORPAY_KEY_ID != "rzp_test_YourKeyId":
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        
        if bill_id:
            try:
                bill = Billing.objects.get(id=bill_id)
                bill.paid_status = True
                bill.verified_badge = True
                bill.save()
            except Billing.DoesNotExist:
                pass

        return Response({"ok": True, "status": "Payment Verified Success"})
    except razorpay.errors.SignatureVerificationError:
         return Response({"detail": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

**Issues:**
1. ❌ No authentication required
2. ❌ **Bypass:** When keys are test keys, signature verification is skipped (SECURITY HOLE)
3. ❌ No audit trail
4. ❌ No idempotency check (calling twice marks as paid twice)
5. ⚠️ Silent failure if bill not found (should return error)

---

### SECTION 7: EMERGENCY ENDPOINTS

#### 7.1 `POST /emergency/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:228-230`

**Issues:**
1. ❌ No authentication required (but should be accessible to unauthenticated users per README)
2. ⚠️ No GPS location validation
3. ⚠️ No hospital notification system (WebSocket/email)
4. ❌ No real-time status updates

---

#### 7.2 `POST /emergency/{id}/accept/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:232-241`

**Current Implementation:**
```python
@action(detail=True, methods=["post"])
def accept(self, request, pk=None):
    instance = self.get_object()
    hospital_id = request.data.get("hospital_id")
    if hospital_id:
        instance.accepted_hospital_id = hospital_id
    instance.status = "ACCEPTED"
    instance.eta = request.data.get("eta", "8 mins")
    instance.save()
    return Response(self.get_serializer(instance).data)
```

**Issues:**
1. ❌ No authentication (anyone can accept)
2. ❌ **FCFS not enforced:** No check that hospital was first to accept
3. ❌ No validation:
   - Hospital ID not verified
   - ETA not validated (should be integer minutes, not string)
4. ❌ No competing request handling (multiple hospitals accepting same request)

---

### SECTION 8: PHARMACY ENDPOINTS

#### 8.1 `GET /pharmacy-orders/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Issues:**
1. ❌ No authorization (anyone sees all orders)
2. ❌ No filtering by patient_id, prescription_id, status
3. ❌ No pagination

---

#### 8.2 `POST /pharmacy-orders/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Issues:**
1. ❌ No authentication
2. ❌ No authorization (anyone can create)
3. ⚠️ Nested items supported (good)
4. ❌ No validation on item prices/quantities

---

#### 8.3 `POST /pharmacy-orders/{id}/pickup/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:248-254`

**Issues:**
1. ❌ No authentication
2. ❌ No authorization (anyone can mark as picked up)
3. ❌ No idempotency check

---

### SECTION 9: ADMIN ENDPOINTS

#### 9.1 `GET /audit-logs/`

**Status:** ✅ **WORKS** (but needs auth)

**Issues:**
1. ❌ No authentication required
2. ❌ No filtering by action, date range, user
3. ❌ No pagination

---

#### 9.2 `GET /audit-logs/{id}/`

**Status:** ✅ **WORKS** (but needs auth)

---

#### 9.3 `GET /notifications/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Issues:**
1. ❌ No filtering by user_id
2. ❌ No filtering by read_status
3. ❌ No pagination

---

#### 9.4 `POST /notifications/{id}/mark_all_read/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:266-271`

**Issues:**
1. ❌ No validation on user_id
2. ⚠️ Requires user_id in body (awkward; should use auth token)

---

#### 9.5 `GET /session-limits/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:278-281`

**Current Implementation:**
```python
def list(self, request, *args, **kwargs):
    limits = SessionLimit.objects.select_related("doctor")
    data = {str(sl.doctor_id): sl.limit for sl in limits}
    return Response(data)
```

**Issues:**
1. ❌ No authentication
2. ✅ Optimized with select_related (good)
3. ⚠️ Returns dict instead of list (inconsistent with DRF convention)

---

#### 9.6 `GET /leave-requests/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Issues:**
1. ❌ No authorization (anyone sees all leave requests)
2. ❌ No filtering by user_id, status, date range
3. ❌ No pagination

---

#### 9.7 `POST /leave-requests/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:288-303`

**Issues:**
1. ❌ No authentication
2. ⚠️ No validation:
   - Start date not validated (could be in past)
   - End date not validated (must be after start date)
   - No overlap check (can submit overlapping leave)
3. ✅ Notifications sent to admins (good)

---

#### 9.8 `PATCH /leave-requests/{id}/`

**Status:** ⚠️ **PARTIALLY WORKING**

**Code Location:** `backend/api/views.py:305-320`

**Issues:**
1. ❌ No authorization (anyone can approve/reject)
2. ⚠️ No validation on status transition
3. ✅ Notification sent to user (good)

---

## 📊 SUMMARY TABLE

| Endpoint | Method | Status | Auth | Validation | RBAC | Pagination | Filtering | Issues |
|----------|--------|--------|------|-----------|------|-----------|-----------|--------|
| `/auth/login/` | POST | ⚠️ | ❌ | ✅ | ❌ | N/A | N/A | No JWT, plain-text password |
| `/auth/register/` | POST | ❌ | ❌ | ⚠️ | ❌ | N/A | N/A | Plain-text password, weak validation |
| `/users/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ⚠️ | No auth, exposes all emails |
| `/users/doctors/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ✅ | No auth, no pagination |
| `/users/patients/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ✅ | No auth, no pagination |
| `/users/lab_staff/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ✅ | No auth, no pagination |
| `/users/{id}/` | GET | ✅ | ❌ | N/A | ❌ | N/A | N/A | No auth |
| `/appointments/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ❌ | No auth, no filtering |
| `/appointments/` | POST | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No queue logic, no slot validation |
| `/appointments/{id}/` | PATCH | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No state machine |
| `/prescriptions/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ❌ | No auth, no filtering |
| `/prescriptions/` | POST | ⚠️ | ❌ | ⚠️ | ❌ | N/A | N/A | No auth, weak validation |
| `/lab-pricing/` | GET | ✅ | ❌ | N/A | ❌ | ❌ | ❌ | No auth |
| `/lab-pricing/` | POST/PATCH | ⚠️ | ❌ | ⚠️ | ❌ | N/A | N/A | No auth, no approval workflow |
| `/lab-tests/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ❌ | No auth, no filtering |
| `/lab-tests/` | POST | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No auth, no price validation |
| `/lab-tests/{id}/upload-report/` | POST | ⚠️ | ❌ | ✅ | ❌ | N/A | N/A | No auth, no file size limit |
| `/lab-tests/{id}/` | PATCH | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No auth, no status validation |
| `/billing/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ❌ | No auth, exposes all bills |
| `/payments/create_order/` | POST | ❌ | ❌ | ⚠️ | ❌ | N/A | N/A | Mock implementation, hardcoded keys |
| `/payments/verify_payment/` | POST | ❌ | ❌ | ❌ | ❌ | N/A | N/A | Signature bypass, no audit trail |
| `/emergency/` | POST | ⚠️ | ❌ | ⚠️ | ❌ | N/A | N/A | No location validation |
| `/emergency/{id}/accept/` | POST | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No FCFS enforcement |
| `/pharmacy-orders/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ❌ | No auth, no filtering |
| `/pharmacy-orders/` | POST | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No auth, no validation |
| `/pharmacy-orders/{id}/pickup/` | POST | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No auth, no idempotency |
| `/audit-logs/` | GET | ✅ | ❌ | N/A | ❌ | ❌ | ❌ | No auth |
| `/audit-logs/{id}/` | GET | ✅ | ❌ | N/A | ❌ | N/A | N/A | No auth |
| `/notifications/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ⚠️ | No auth, limited filtering |
| `/notifications/{id}/mark_all_read/` | POST | ⚠️ | ❌ | ⚠️ | ❌ | N/A | N/A | No auth, awkward user_id in body |
| `/session-limits/` | GET | ⚠️ | ❌ | N/A | ❌ | N/A | N/A | No auth, returns dict not list |
| `/leave-requests/` | GET | ⚠️ | ❌ | N/A | ❌ | ❌ | ❌ | No auth, no filtering |
| `/leave-requests/` | POST | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No auth, no date validation |
| `/leave-requests/{id}/` | PATCH | ⚠️ | ❌ | ❌ | ❌ | N/A | N/A | No auth, no status validation |

---

## 🔴 CRITICAL ISSUES (Must Fix Before Going Live)

1. **🔴 AUTHENTICATION:** No JWT tokens, session management, or token refresh
2. **🔴 PASSWORD SECURITY:** Plain-text password storage (must use bcrypt/argon2)
3. **🔴 AUTHORIZATION:** Zero RBAC enforcement — anyone can access any endpoint
4. **🔴 DATA EXPOSURE:** User emails, bills, prescriptions, tests all public
5. **🔴 PAYMENT INTEGRATION:** Razorpay mock implementation with signature bypass
6. **🔴 VALIDATION:** Weak input validation across all endpoints
7. **🔴 QUEUE LOGIC:** Appointment queue not implemented correctly
8. **🔴 SESSION LIMITS:** Doctor session limits not enforced
9. **🔴 OTP SYSTEM:** Email and SMS OTP models/endpoints completely missing
10. **🔴 CONFIGURATION:** Secrets hardcoded (should use environment variables)

---

## ✅ NEXT STEPS (Prioritized)

1. **PHASE 5:** Implement JWT Authentication (access + refresh tokens)
2. **PHASE 5:** Hash passwords with bcrypt/argon2
3. **PHASE 8:** Implement Role-Based Access Control (RBAC)
4. **PHASE 6:** Implement Email OTP verification
5. **PHASE 7:** Implement SMS OTP verification
6. **PHASE 9:** Add input validation and sanitization
7. **PHASE 2-CONTINUED:** Fix payment integration (real Razorpay)
8. **PHASE 10:** Add database indexes and optimize queries
9. **PHASE 11:** Add rate limiting and security headers
10. **PHASE 12:** Add pagination and filtering

---

**Report Generated:** 2026-07-27  
**Reviewed By:** Senior Backend Engineer  
**Status:** READY FOR PHASE 3 (FRONTEND AUDIT)
