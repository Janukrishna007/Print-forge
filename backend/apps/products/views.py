from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Product, ProductView
from .serializers import ProductDetailSerializer, ProductListSerializer, ProductViewMappingSerializer, ProductViewSerializer
from .services import sync_media_products


class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductListSerializer

    def get_queryset(self):
        sync_media_products()
        return (
            Product.objects.filter(is_active=True, views__is_active=True)
            .prefetch_related("views")
            .distinct()
        )


class ProductDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer

    def get_queryset(self):
        sync_media_products()
        return (
            Product.objects.filter(is_active=True, views__is_active=True)
            .prefetch_related("views")
            .distinct()
        )


class ProductViewListAPIView(generics.ListAPIView):
    serializer_class = ProductViewSerializer

    def get_queryset(self):
        sync_media_products()
        return ProductView.objects.filter(product_id=self.kwargs["pk"], is_active=True).select_related("product")


class ProductViewMappingUpdateAPIView(generics.UpdateAPIView):
    queryset = ProductView.objects.filter(is_active=True).select_related("product")
    serializer_class = ProductViewMappingSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
