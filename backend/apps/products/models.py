from django.db import models
from django.utils.text import slugify


def default_print_area() -> dict:
    return {"x": 120, "y": 160, "width": 520, "height": 520}


def default_perspective_points() -> list:
    return [[120, 160], [640, 160], [640, 680], [120, 680]]


class Product(models.Model):
    CATEGORY_CHOICES = [
        ("tshirts", "T-Shirts"),
        ("hoodies", "Hoodies"),
        ("caps", "Caps"),
        ("totes", "Tote Bags"),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default="tshirts")
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=29.99)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class ProductView(models.Model):
    VIEW_CHOICES = [
        ("front", "Front"),
        ("back", "Back"),
        ("side", "Side"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="views")
    name = models.CharField(max_length=40, choices=VIEW_CHOICES, default="front")
    image = models.ImageField(upload_to="products/")
    print_area = models.JSONField(default=default_print_area)
    perspective_points = models.JSONField(default=default_perspective_points)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "id"]
        unique_together = ("product", "name")

    def __str__(self) -> str:
        return f"{self.product.name} - {self.get_name_display()}"
