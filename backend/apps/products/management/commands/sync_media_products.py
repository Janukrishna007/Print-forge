from django.core.management.base import BaseCommand

from apps.products.services import sync_media_products


class Command(BaseCommand):
    help = "Sync product and view records from files stored in media/products."

    def handle(self, *args, **options):
        summary = sync_media_products()
        self.stdout.write(
            self.style.SUCCESS(
                "Synced media products "
                f"(created_products={summary['created_products']}, "
                f"created_views={summary['created_views']}, "
                f"updated_views={summary['updated_views']})."
            )
        )
