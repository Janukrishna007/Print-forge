from __future__ import annotations

from pathlib import Path
import re

from django.conf import settings
from django.utils.text import slugify
from PIL import Image

from .models import Product, ProductView


VIEW_NAMES = {"front", "back", "side"}
AUTO_SYNC_PREFIX = "Auto-synced from media/products/"


def prettify_name(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("-", " ").replace("_", " ")).strip().title()


def detect_view(stem: str) -> tuple[str, str]:
    lowered = stem.lower().strip()
    for view_name in VIEW_NAMES:
        suffix = f"-{view_name}"
        if lowered.endswith(suffix):
            return lowered[: -len(suffix)], view_name
        suffix = f"_{view_name}"
        if lowered.endswith(suffix):
            return lowered[: -len(suffix)], view_name
        suffix = f" {view_name}"
        if lowered.endswith(suffix):
            return lowered[: -len(suffix)], view_name
    return lowered, "front"


def default_print_area(width: int | None, height: int | None) -> dict:
    width = width or 1200
    height = height or 1200
    area_width = int(width * 0.42)
    area_height = int(height * 0.42)
    x = int((width - area_width) / 2)
    y = int(height * 0.22)
    return {
        "x": max(0, x),
        "y": max(0, y),
        "width": max(120, area_width),
        "height": max(120, area_height),
    }


def default_perspective_points(area: dict) -> list[list[int]]:
    x = area["x"]
    y = area["y"]
    width = area["width"]
    height = area["height"]
    return [[x, y], [x + width, y], [x + width, y + height], [x, y + height]]


def guess_category(name: str) -> str:
    lowered = name.lower()
    if "hoodie" in lowered:
        return "hoodies"
    if "cap" in lowered:
        return "caps"
    if "tote" in lowered or "bag" in lowered:
        return "totes"
    return "tshirts"


def describe_auto_synced_product(product_slug: str, source_files: list[str]) -> str:
    if len(source_files) == 1:
        return f"{AUTO_SYNC_PREFIX}{source_files[0]}"
    return f"{AUTO_SYNC_PREFIX}{product_slug} ({len(source_files)} views)"


def read_image_size(image_path: Path) -> tuple[int | None, int | None]:
    try:
        with Image.open(image_path) as image:
            return image.size
    except Exception:
        return None, None


def sync_media_products() -> dict:
    products_dir = Path(settings.MEDIA_ROOT) / "products"
    products_dir.mkdir(parents=True, exist_ok=True)

    created_products = 0
    created_views = 0
    updated_views = 0
    deactivated_products = 0
    deactivated_views = 0

    desired_products: dict[str, dict] = {}

    for image_path in sorted(products_dir.iterdir()):
        if not image_path.is_file() or image_path.name.startswith("."):
            continue
        if image_path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue

        product_stem, view_name = detect_view(image_path.stem)
        product_slug = slugify(product_stem) or slugify(image_path.stem) or f"product-{image_path.stem.lower()}"
        product_name = prettify_name(product_stem) or prettify_name(image_path.stem) or "Untitled Product"
        image_width, image_height = read_image_size(image_path)

        entry = desired_products.setdefault(
            product_slug,
            {
                "name": product_name,
                "category": guess_category(product_name),
                "source_files": [],
                "views": {},
            },
        )
        entry["source_files"].append(image_path.name)

        area = default_print_area(image_width, image_height)

        entry["views"][view_name] = {
            "image_path": f"products/{image_path.name}",
            "print_area": area,
            "perspective_points": default_perspective_points(area),
            "display_order": {"front": 0, "back": 1, "side": 2}.get(view_name, 0),
        }

    desired_slugs = set(desired_products.keys())
    auto_synced_products = Product.objects.filter(description__startswith=AUTO_SYNC_PREFIX).prefetch_related("views")

    for product_slug, product_data in desired_products.items():
        product, was_created = Product.objects.get_or_create(
            slug=product_slug,
            defaults={
                "name": product_data["name"],
                "category": product_data["category"],
                "description": describe_auto_synced_product(product_slug, product_data["source_files"]),
                "base_price": 29.99,
                "is_active": True,
            },
        )
        if was_created:
            created_products += 1
        else:
            product_changed = False
            desired_description = describe_auto_synced_product(product_slug, product_data["source_files"])
            for field, value in (
                ("name", product_data["name"]),
                ("category", product_data["category"]),
                ("description", desired_description),
                ("is_active", True),
            ):
                if getattr(product, field) != value:
                    setattr(product, field, value)
                    product_changed = True
            if product_changed:
                product.save(update_fields=["name", "category", "description", "is_active", "updated_at"])

        desired_view_names = set(product_data["views"].keys())
        existing_views = {view.name: view for view in product.views.all()}

        for view_name, view_data in product_data["views"].items():
            view = existing_views.get(view_name)
            view_created = view is None
            if view_created:
                view = ProductView(product=product, name=view_name)
                created_views += 1

            changed = view_created
            if view.image.name != view_data["image_path"]:
                view.image.name = view_data["image_path"]
                changed = True

            if view.display_order != view_data["display_order"]:
                view.display_order = view_data["display_order"]
                changed = True

            if view_created or not view.print_area:
                view.print_area = view_data["print_area"]
                changed = True

            if view_created or not view.perspective_points:
                view.perspective_points = view_data["perspective_points"]
                changed = True

            if not view.is_active:
                view.is_active = True
                changed = True

            if changed:
                if not view_created:
                    updated_views += 1
                view.save()

        for stale_view in product.views.filter(is_active=True).exclude(name__in=desired_view_names):
            stale_view.is_active = False
            stale_view.save(update_fields=["is_active", "updated_at"])
            deactivated_views += 1

    for stale_product in auto_synced_products.exclude(slug__in=desired_slugs):
        active_stale_views = stale_product.views.filter(is_active=True)
        active_stale_view_count = active_stale_views.count()
        if active_stale_view_count:
            active_stale_views.update(is_active=False)
            deactivated_views += active_stale_view_count
        if stale_product.is_active:
            stale_product.is_active = False
            stale_product.save(update_fields=["is_active", "updated_at"])
            deactivated_products += 1

    return {
        "created_products": created_products,
        "created_views": created_views,
        "updated_views": updated_views,
        "deactivated_products": deactivated_products,
        "deactivated_views": deactivated_views,
    }


def rebuild_products_from_media() -> dict:
    ProductView.objects.all().delete()
    Product.objects.all().delete()
    return sync_media_products()
