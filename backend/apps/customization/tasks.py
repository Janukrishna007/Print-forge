from django.core.files.base import ContentFile
from django.utils import timezone
from PIL import Image

from printforge.celery import app

from apps.rendering.utils import (
    RenderTransform,
    composite_on_base,
    sanitize_design_image,
    save_image_to_content,
    warp_design,
)

from .models import CustomizationJob


def update_job(job: CustomizationJob, *, status=None, progress=None, error_message=None):
    fields = []
    if status is not None:
        job.status = status
        fields.append("status")
    if progress is not None:
        job.progress = progress
        fields.append("progress")
    if error_message is not None:
        job.error_message = error_message
        fields.append("error_message")
    if fields:
        fields.append("updated_at")
        job.save(update_fields=fields)


@app.task(name="customization.render_customization")
def render_customization_task(job_id: str):
    job = CustomizationJob.objects.select_related("product_view", "product").get(pk=job_id)
    try:
        update_job(job, status=CustomizationJob.STATUS_PROCESSING, progress=10)
        base_view = job.product_view

        with base_view.image.open("rb") as base_file, job.design_upload.open("rb") as design_file:
            product_image = Image.open(base_file).convert("RGBA")
            design_image = sanitize_design_image(Image.open(design_file).convert("RGBA"))

        update_job(job, progress=35)
        transform = RenderTransform(
            scale=job.parameters.get("scale", 1.0),
            offset_x=job.parameters.get("offset_x", 0.0),
            offset_y=job.parameters.get("offset_y", 0.0),
            opacity=job.parameters.get("opacity", 1.0),
            blend_mode="alpha_composite",
        )
        warped = warp_design(
            design_image,
            output_size=product_image.size,
            area=base_view.print_area,
            perspective_points=base_view.perspective_points,
            transform=transform,
        )

        update_job(job, progress=60)
        update_job(job, progress=85)
        final_image = composite_on_base(product_image, warped, transform=transform)
        filename, content = save_image_to_content(final_image, f"{job.id}.png")
        job.result_image.save(filename, ContentFile(content), save=False)
        job.status = CustomizationJob.STATUS_COMPLETED
        job.progress = 100
        job.completed_at = timezone.now()
        job.error_message = ""
        job.save(update_fields=["result_image", "status", "progress", "completed_at", "error_message", "updated_at"])
    except Exception as exc:
        job.status = CustomizationJob.STATUS_FAILED
        job.progress = 100
        job.error_message = str(exc)
        job.save(update_fields=["status", "progress", "error_message", "updated_at"])
        raise
