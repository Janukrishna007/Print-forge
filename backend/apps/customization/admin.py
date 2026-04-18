from django.contrib import admin

from .models import CustomizationJob


@admin.register(CustomizationJob)
class CustomizationJobAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "product_view", "status", "progress", "created_at", "completed_at")
    list_filter = ("status", "product__category", "product_view__name")
    search_fields = ("id", "product__name")
    readonly_fields = ("created_at", "updated_at", "completed_at")
