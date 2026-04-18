from django.db import migrations, models
import django.db.models.deletion

import apps.products.models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("slug", models.SlugField(blank=True, max_length=220, unique=True)),
                (
                    "category",
                    models.CharField(
                        choices=[("tshirts", "T-Shirts"), ("hoodies", "Hoodies"), ("caps", "Caps"), ("totes", "Tote Bags")],
                        default="tshirts",
                        max_length=40,
                    ),
                ),
                ("description", models.TextField(blank=True)),
                ("base_price", models.DecimalField(decimal_places=2, default=29.99, max_digits=10)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["category", "name"]},
        ),
        migrations.CreateModel(
            name="ProductView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(choices=[("front", "Front"), ("back", "Back"), ("side", "Side")], default="front", max_length=40)),
                ("image", models.ImageField(upload_to="products/")),
                ("mask_image", models.ImageField(blank=True, null=True, upload_to="masks/")),
                ("displacement_map", models.ImageField(blank=True, null=True, upload_to="displacement_maps/")),
                ("print_area", models.JSONField(default=apps.products.models.default_print_area)),
                ("perspective_points", models.JSONField(default=apps.products.models.default_perspective_points)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="views", to="products.product")),
            ],
            options={"ordering": ["display_order", "id"], "unique_together": {("product", "name")}},
        ),
    ]
