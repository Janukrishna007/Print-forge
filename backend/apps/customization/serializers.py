from rest_framework import serializers

from apps.products.models import Product, ProductView

from .models import CustomizationJob


class CustomizationCreateSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True), source="product")
    product_view_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductView.objects.filter(is_active=True),
        source="product_view",
    )
    design = serializers.ImageField()
    scale = serializers.FloatField(default=1.0, min_value=0.2, max_value=2.5)
    offset_x = serializers.FloatField(default=0.0)
    offset_y = serializers.FloatField(default=0.0)
    opacity = serializers.FloatField(default=1.0, min_value=0.1, max_value=1.0)
    blend_mode = serializers.ChoiceField(choices=["soft_light", "overlay", "multiply"], default="soft_light")
    print_size = serializers.IntegerField(default=100, min_value=40, max_value=160)

    def validate(self, attrs):
        if attrs["product_view"].product_id != attrs["product"].id:
            raise serializers.ValidationError("Selected view does not belong to the selected product.")
        return attrs


class CustomizationJobSerializer(serializers.ModelSerializer):
    result_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomizationJob
        fields = [
            "id",
            "status",
            "progress",
            "error_message",
            "parameters",
            "created_at",
            "updated_at",
            "completed_at",
            "result_url",
        ]

    def get_result_url(self, obj):
        if not obj.result_image:
            return None
        return obj.result_image.url
