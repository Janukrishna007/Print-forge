from rest_framework import serializers

from .models import Product, ProductView


def safe_image_dimension(file_field, attr: str):
    try:
        return getattr(file_field, attr)
    except (FileNotFoundError, ValueError, OSError):
        return None


class ProductViewSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image_width = serializers.SerializerMethodField()
    image_height = serializers.SerializerMethodField()

    class Meta:
        model = ProductView
        fields = [
            "id",
            "name",
            "image_url",
            "image_width",
            "image_height",
            "print_area",
            "perspective_points",
            "display_order",
        ]

    def get_image_url(self, obj):
        return obj.image.url

    def get_image_width(self, obj):
        return safe_image_dimension(obj.image, "width")

    def get_image_height(self, obj):
        return safe_image_dimension(obj.image, "height")


class ProductListSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    default_view_id = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "description", "base_price", "thumbnail", "default_view_id"]

    def get_thumbnail(self, obj):
        first_view = obj.views.filter(is_active=True).order_by("display_order", "id").first()
        if not first_view:
            return None
        return first_view.image.url

    def get_default_view_id(self, obj):
        first_view = obj.views.filter(is_active=True).order_by("display_order", "id").first()
        return first_view.id if first_view else None


class ProductDetailSerializer(serializers.ModelSerializer):
    views = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "description", "base_price", "views"]

    def get_views(self, obj):
        queryset = obj.views.filter(is_active=True).order_by("display_order", "id")
        return ProductViewSerializer(queryset, many=True, context=self.context).data


class ProductViewMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductView
        fields = ["id", "print_area", "perspective_points"]

    def validate_print_area(self, value):
        required = {"x", "y", "width", "height"}
        if not isinstance(value, dict) or not required.issubset(value.keys()):
            raise serializers.ValidationError("Print area must contain x, y, width, and height.")

        normalized = {
            "x": max(0, int(value["x"])),
            "y": max(0, int(value["y"])),
            "width": max(40, int(value["width"])),
            "height": max(40, int(value["height"])),
        }
        return normalized

    def validate_perspective_points(self, value):
        if value in (None, ""):
            return value
        if not isinstance(value, list) or len(value) != 4:
            raise serializers.ValidationError("Perspective points must include exactly four points.")
        normalized = []
        for point in value:
            if not isinstance(point, (list, tuple)) or len(point) != 2:
                raise serializers.ValidationError("Each perspective point must contain x and y.")
            normalized.append([int(point[0]), int(point[1])])
        return normalized

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if "print_area" in attrs and "perspective_points" not in attrs:
            area = attrs["print_area"]
            attrs["perspective_points"] = [
                [area["x"], area["y"]],
                [area["x"] + area["width"], area["y"]],
                [area["x"] + area["width"], area["y"] + area["height"]],
                [area["x"], area["y"] + area["height"]],
            ]
        return attrs
