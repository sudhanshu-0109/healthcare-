from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"auth", views.AuthViewSet, basename="auth")
router.register(r"users", views.UserViewSet, basename="users")
router.register(r"appointments", views.AppointmentViewSet, basename="appointments")
router.register(r"prescriptions", views.PrescriptionViewSet, basename="prescriptions")
router.register(r"lab-pricing", views.LabPricingViewSet, basename="lab-pricing")
router.register(r"lab-tests", views.LabTestViewSet, basename="lab-tests")
router.register(r"billing", views.BillingViewSet, basename="billing")
router.register(r"emergency", views.EmergencyRequestViewSet, basename="emergency")
router.register(r"pharmacy-orders", views.PharmacyOrderViewSet, basename="pharmacy-orders")
router.register(r"audit-logs", views.AuditLogViewSet, basename="audit-logs")
router.register(r"notifications", views.NotificationViewSet, basename="notifications")
router.register(r"session-limits", views.SessionLimitViewSet, basename="session-limits")
router.register(r"leave-requests", views.LeaveRequestViewSet, basename="leave-requests")
router.register(r"payments", views.PaymentViewSet, basename="payments")

urlpatterns = [
    path("", include(router.urls)),
]
