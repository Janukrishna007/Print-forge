import uuid

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [("products", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="CustomizationJob",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("design_upload", models.ImageField(upload_to="uploads/")),
                ("result_image", models.ImageField(blank=True, null=True, upload_to="results/")),
                (
                    "status",
                    models.CharField(
                        choices=[("pending", "Pending"), ("processing", "Processing"), ("completed", "Completed"), ("failed", "Failed")],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("progress", models.PositiveSmallIntegerField(default=0)),
                ("parameters", models.JSONField(blank=True, default=dict)),
                ("error_message", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="customizations", to="products.product")),
                ("product_view", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="customizations", to="products.productview")),
            ],
            options={"ordering": ["-created_at"]},
        )
    ]
