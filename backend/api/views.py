from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import razorpay

RAZORPAY_KEY_ID = getattr(settings, "RAZORPAY_KEY_ID", "rzp_test_YourKeyId")
RAZORPAY_KEY_SECRET = getattr(settings, "RAZORPAY_KEY_SECRET", "YourKeySecret")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

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
    Prescription,
    SessionLimit,
    User,
)
from .serializers import (
    AppointmentSerializer,
    AuditLogSerializer,
    BillingSerializer,
    EmergencyRequestSerializer,
    LabPricingSerializer,
    LabTestSerializer,
    LeaveRequestSerializer,
    NotificationSerializer,
    PharmacyOrderSerializer,
    PrescriptionSerializer,
    SessionLimitSerializer,
    UserLoginSerializer,
    UserSerializer,
)


class AuthViewSet(viewsets.ViewSet):
    REGISTER_ROLES = ("doctor", "patient", "lab")

    @action(detail=False, methods=["post"])
    def login(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""
        user = User.objects.filter(email=email, password=password).first()
        if not user:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(UserLoginSerializer(user).data)

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
            return Response(
                {"detail": f"Role must be one of: {', '.join(self.REGISTER_ROLES)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(email=email).exists():
            return Response({"detail": "An account with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            name=name,
            email=email,
            password=password,
            role=role,
            specialty=specialty if role == "doctor" else None,
        )
        return Response(UserLoginSerializer(user).data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False)
    def doctors(self, request):
        qs = User.objects.filter(role="doctor")
        return Response(UserSerializer(qs, many=True).data)

    @action(detail=False)
    def patients(self, request):
        qs = User.objects.filter(role="patient")
        return Response(UserSerializer(qs, many=True).data)

    @action(detail=False)
    def lab_staff(self, request):
        qs = User.objects.filter(role="lab")
        return Response(UserSerializer(qs, many=True).data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

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

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if "status" in request.data:
            instance.status = request.data["status"]
            if request.data["status"] == "IN_PROGRESS":
                Notification.objects.create(
                    user_id=instance.patient_id,
                    read_status=False,
                    created_at=instance.date,
                    message=f"Doctor is ready for you! Queue #{instance.queue_number} — proceed to room.",
                    type="queue",
                )
            instance.save()
        return Response(self.get_serializer(instance).data)


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        Notification.objects.create(
            user_id=instance.patient_id,
            message=f"Prescription from {instance.doctor_name}: {instance.diagnosis} ({instance.medicines.count()} medicines)",
            read_status=False,
            created_at=instance.created_at,
            type="medicine",
        )


class LabPricingViewSet(viewsets.ModelViewSet):
    queryset = LabPricing.objects.all()
    serializer_class = LabPricingSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            action="PRICE_UPDATE",
            performed_by="Admin",
            detail=f"{instance.test_name} updated to ₹{instance.price}",
            timestamp=timezone.now().date().isoformat(),
        )


class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]

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

        Notification.objects.create(
            user_id=instance.patient_id,
            message=f"Report for \"{instance.test_name}\" is ready.",
            read_status=False,
            created_at=instance.requested_at,
            type="lab",
        )
        return Response(self.get_serializer(instance).data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if "status" in request.data:
            instance.status = request.data["status"]
        if "report_url" in request.data:
            instance.report_url = request.data["report_url"]
        if "report_content" in request.data:
            instance.report_content = request.data["report_content"]
        instance.save()
        if instance.status == "COMPLETED":
            Notification.objects.create(
                user_id=instance.patient_id,
                message=f"Report for \"{instance.test_name}\" is ready.",
                read_status=False,
                created_at=instance.requested_at,
                type="lab",
            )
        return Response(self.get_serializer(instance).data)


class BillingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer


class EmergencyRequestViewSet(viewsets.ModelViewSet):
    queryset = EmergencyRequest.objects.all()
    serializer_class = EmergencyRequestSerializer

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


class PharmacyOrderViewSet(viewsets.ModelViewSet):
    queryset = PharmacyOrder.objects.all()
    serializer_class = PharmacyOrderSerializer

    @action(detail=True, methods=["post"])
    def pickup(self, request, pk=None):
        instance = self.get_object()
        instance.picked_up = True
        instance.status = "PICKED_UP"
        instance.save()
        return Response(self.get_serializer(instance).data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        user_id = request.data.get("user_id")
        if user_id:
            Notification.objects.filter(user_id=user_id).update(read_status=True)
        return Response({"ok": True})


class SessionLimitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SessionLimit.objects.all()
    serializer_class = SessionLimitSerializer

    def list(self, request, *args, **kwargs):
        limits = SessionLimit.objects.select_related("doctor")
        data = {str(sl.doctor_id): sl.limit for sl in limits}
        return Response(data)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().select_related("user")
    serializer_class = LeaveRequestSerializer

    def perform_create(self, serializer):
        leave = serializer.save(status="PENDING")
        # Notify all admins about the new leave request
        admins = User.objects.filter(role="admin")
        msg = (
            f"New leave request from {leave.user.name} ({leave.role}) "
            f"{leave.start_date} → {leave.end_date}"
        )
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=msg,
                read_status=False,
                created_at=timezone.now().date(),
                type="leave",
            )

    def perform_update(self, serializer):
        prev = self.get_object()
        prev_status = prev.status
        leave = serializer.save()
        if prev_status != leave.status and leave.status in {"APPROVED", "REJECTED"}:
            msg = (
                f"Your leave {leave.start_date} → {leave.end_date} "
                f"was {leave.status.lower()} by admin."
            )
            Notification.objects.create(
                user=leave.user,
                message=msg,
                read_status=False,
                created_at=timezone.now().date(),
                type="leave",
            )

class PaymentViewSet(viewsets.ViewSet):
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
