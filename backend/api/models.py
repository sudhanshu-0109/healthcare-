from django.db import models


class User(models.Model):
    """Healthcare user (doctor, patient, lab, admin, hospital, pharmacy)."""

    ROLES = [
        ("doctor", "Doctor"),
        ("patient", "Patient"),
        ("lab", "Lab"),
        ("admin", "Admin"),
        ("hospital", "Hospital"),
        ("pharmacy", "Pharmacy"),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # demo only
    role = models.CharField(max_length=20, choices=ROLES)
    specialty = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "api_user"

    def __str__(self) -> str:
        return f"{self.name} ({self.role})"


class Appointment(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="patient_appointments")
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="doctor_appointments")
    date = models.DateField()
    time = models.CharField(max_length=20)
    status = models.CharField(max_length=20)  # PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    queue_number = models.PositiveIntegerField(default=1)
    patient_name = models.CharField(max_length=255)
    doctor_name = models.CharField(max_length=255)


class Prescription(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="prescriptions")
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="prescriptions_written")
    diagnosis = models.CharField(max_length=255)
    created_at = models.DateField()
    patient_name = models.CharField(max_length=255)
    doctor_name = models.CharField(max_length=255)


class PrescriptionMedicine(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="medicines")
    name = models.CharField(max_length=255)
    dosage_per_day = models.CharField(max_length=20)
    duration_days = models.PositiveIntegerField()
    instructions = models.CharField(max_length=255, blank=True)


class LabPricing(models.Model):
    test_name = models.CharField(max_length=255)
    price = models.PositiveIntegerField()
    last_updated = models.DateField()


class LabTest(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lab_tests")
    doctor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="requested_lab_tests", null=True, blank=True
    )
    test_name = models.CharField(max_length=255)
    fixed_price = models.PositiveIntegerField()
    status = models.CharField(max_length=20)  # PENDING, COMPLETED
    report_url = models.URLField(max_length=500, null=True, blank=True)
    report_content = models.TextField(blank=True, null=True)  # optional note
    report_file = models.FileField(upload_to="lab_reports/", null=True, blank=True)
    patient_name = models.CharField(max_length=255)
    requested_at = models.DateField()


class Billing(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bills")
    consultation_fee = models.PositiveIntegerField(default=0)
    lab_fee = models.PositiveIntegerField(default=0)
    pharmacy_fee = models.PositiveIntegerField(default=0)
    total_amount = models.PositiveIntegerField()
    paid_status = models.BooleanField(default=False)
    created_at = models.DateField()
    receipt_id = models.CharField(max_length=50)
    verified_badge = models.BooleanField(default=False)


class EmergencyRequest(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="emergency_requests")
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=20)  # REQUESTED, ACCEPTED, COMPLETED
    accepted_hospital = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="accepted_emergencies"
    )
    created_at = models.DateField()
    eta = models.CharField(max_length=20, blank=True, null=True)


class PharmacyOrder(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pharmacy_orders")
    prescription = models.ForeignKey(
        Prescription, on_delete=models.CASCADE, related_name="pharmacy_orders", null=True, blank=True
    )
    status = models.CharField(max_length=20)  # READY, PICKED_UP
    generated_at = models.DateField()
    total_amount = models.PositiveIntegerField()
    picked_up = models.BooleanField(default=False)
    reminders_active = models.BooleanField(default=True)


class PharmacyOrderItem(models.Model):
    order = models.ForeignKey(PharmacyOrder, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=255)
    qty = models.PositiveIntegerField()
    unit_price = models.PositiveIntegerField()


class AuditLog(models.Model):
    action = models.CharField(max_length=50)
    performed_by = models.CharField(max_length=255)
    detail = models.CharField(max_length=255)
    timestamp = models.DateField()


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    read_status = models.BooleanField(default=False)
    created_at = models.DateField()
    type = models.CharField(max_length=50, blank=True)


class SessionLimit(models.Model):
    """Max patients per day per doctor."""

    doctor = models.OneToOneField(User, on_delete=models.CASCADE, related_name="session_limit")
    limit = models.PositiveIntegerField(default=20)


class LeaveRequest(models.Model):
    """Leave application for doctors and lab assistants."""

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leave_requests")
    role = models.CharField(max_length=20, choices=User.ROLES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateField(auto_now_add=True)

    class Meta:
        db_table = "api_leave_request"

    def __str__(self) -> str:
        return f"{self.user.name} {self.start_date}→{self.end_date} ({self.status})"
