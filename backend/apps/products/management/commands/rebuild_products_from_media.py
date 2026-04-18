from django.core.management.base import BaseCommand

from apps.products.services import rebuild_products_from_media


class Command(BaseCommand):
    help = "Delete existing product catalog entries and rebuild them from media/products."

    def handle(self, *args, **options):
        summary = rebuild_products_from_media()
        self.stdout.write(
            self.style.SUCCESS(
                "Rebuilt products from media "
                f"(created_products={summary['created_products']}, "
                f"created_views={summary['created_views']}, "
                f"updated_views={summary['updated_views']})."
            )
        )
