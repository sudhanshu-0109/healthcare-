from rest_framework import serializers

from .models import (
    Appointment,
    AuditLog,
    Billing,
    EmergencyRequest,
    LabPricing,
    LabTest,
    LeaveRequest,
    Notification,
    PharmacyOrder,
    PharmacyOrderItem,
    Prescription,
    PrescriptionMedicine,
    SessionLimit,
    User,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "specialty"]
        read_only_fields = ["id"]


class UserLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "specialty"]


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "date",
            "time",
            "status",
            "queue_number",
            "patient_name",
            "doctor_name",
        ]


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionMedicine
        fields = ["id", "name", "dosage_per_day", "duration_days", "instructions"]


class PrescriptionSerializer(serializers.ModelSerializer):
    medicines = PrescriptionMedicineSerializer(many=True)

    class Meta:
        model = Prescription
        fields = [
            "id",
            "patient",
            "doctor",
            "diagnosis",
            "created_at",
            "patient_name",
            "doctor_name",
            "medicines",
        ]

    def create(self, validated_data):
        meds_data = validated_data.pop("medicines", [])
        p = Prescription.objects.create(**validated_data)
        for m in meds_data:
            PrescriptionMedicine.objects.create(prescription=p, **m)
        return p


class LabPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabPricing
        fields = ["id", "test_name", "price", "last_updated"]


class LabTestSerializer(serializers.ModelSerializer):
    report_file_url = serializers.SerializerMethodField()

    class Meta:
        model = LabTest
        fields = [
            "id",
            "patient",
            "doctor",
            "test_name",
            "fixed_price",
            "status",
            "report_url",
            "report_content",
            "report_file",
            "report_file_url",
            "patient_name",
            "requested_at",
        ]

    def get_report_file_url(self, obj):
        if not obj.report_file:
            return None
        request = self.context.get("request")
        url = obj.report_file.url
        return request.build_absolute_uri(url) if request else url


class BillingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Billing
        fields = [
            "id",
            "patient",
            "consultation_fee",
            "lab_fee",
            "pharmacy_fee",
            "total_amount",
            "paid_status",
            "created_at",
            "receipt_id",
            "verified_badge",
        ]


class EmergencyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyRequest
        fields = ["id", "patient", "location", "status", "accepted_hospital", "created_at", "eta"]


class PharmacyOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyOrderItem
        fields = ["id", "name", "qty", "unit_price"]


class PharmacyOrderSerializer(serializers.ModelSerializer):
    items = PharmacyOrderItemSerializer(many=True)

    class Meta:
        model = PharmacyOrder
        fields = [
            "id",
            "patient",
            "prescription",
            "status",
            "generated_at",
            "total_amount",
            "picked_up",
            "reminders_active",
            "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = PharmacyOrder.objects.create(**validated_data)
        for item in items_data:
            PharmacyOrderItem.objects.create(order=order, **item)
        return order


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ["id", "action", "performed_by", "detail", "timestamp"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "message", "read_status", "created_at", "type"]


class SessionLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionLimit
        fields = ["id", "doctor", "limit"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "user",
            "user_name",
            "role",
            "start_date",
            "end_date",
            "reason",
            "status",
            "created_at",
        ]

    def get_user_name(self, obj):
        try:
            return obj.user.name
        except Exception:
            return ""
