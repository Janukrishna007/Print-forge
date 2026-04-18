import json

from django.contrib import admin
from django.utils.html import format_html

from .forms import ProductViewAdminForm
from .models import Product, ProductView


class ProductViewInline(admin.TabularInline):
    model = ProductView
    extra = 0
    fields = ("name", "image", "display_order", "is_active")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "base_price", "is_active", "updated_at")
    list_filter = ("category", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductViewInline]


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    form = ProductViewAdminForm
    list_display = ("product", "name", "display_order", "is_active")
    list_filter = ("name", "is_active", "product__category")
    search_fields = ("product__name",)
    readonly_fields = ("image_preview",)
    fieldsets = (
        ("Core", {"fields": ("product", "name", "display_order", "is_active")}),
        (
            "Assets",
            {
                "fields": ("image", "image_preview"),
                "description": "Upload the garment view image used for live previews and final rendering.",
            },
        ),
        (
            "Print Mapping",
            {
                "fields": ("print_area", "perspective_points"),
                "description": "Use the helper canvas to reposition the print area and capture four perspective points.",
            },
        ),
    )

    class Media:
        css = {"all": ("admin/css/printforge_admin.css",)}
        js = ("admin/js/printforge_admin.js",)

    @admin.display(description="Preview")
    def image_preview(self, obj):
        if not obj.image:
            return "Save this product view to enable the visual mapper."
        return format_html(
            """
            <div class="printforge-admin-preview" data-printforge-mapper
                 data-image-url="{image}"
                 data-print-area="{area}"
                 data-points="{points}">
              <p class="help">
                Drag the blue print rectangle. Use the mouse wheel to resize it. Click on the image to set the 4 perspective points in order.
              </p>
              <div class="printforge-admin-stage">
                <img src="{image}" alt="Preview" />
                <canvas></canvas>
              </div>
            </div>
            """,
            image=obj.image.url,
            area=json.dumps(obj.print_area),
            points=json.dumps(obj.perspective_points),
        )
