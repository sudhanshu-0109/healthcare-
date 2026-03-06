from django.contrib import admin

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


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "role", "specialty")
    list_filter = ("role",)
    search_fields = ("name", "email")


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "role", "start_date", "end_date", "status", "created_at")
    list_filter = ("role", "status")
    search_fields = ("user__name", "user__email")


admin.site.register(Appointment)
admin.site.register(Prescription)
admin.site.register(PrescriptionMedicine)
admin.site.register(LabPricing)
admin.site.register(LabTest)
admin.site.register(Billing)
admin.site.register(EmergencyRequest)
admin.site.register(PharmacyOrder)
admin.site.register(PharmacyOrderItem)
admin.site.register(AuditLog)
admin.site.register(Notification)
admin.site.register(SessionLimit)
