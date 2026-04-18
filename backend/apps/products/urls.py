from django.urls import path

from .views import ProductDetailAPIView, ProductListAPIView, ProductViewListAPIView, ProductViewMappingUpdateAPIView

urlpatterns = [
    path("products/", ProductListAPIView.as_view(), name="product-list"),
    path("products/<int:pk>/", ProductDetailAPIView.as_view(), name="product-detail"),
    path("products/<int:pk>/views/", ProductViewListAPIView.as_view(), name="product-views"),
    path("product-views/<int:pk>/mapping/", ProductViewMappingUpdateAPIView.as_view(), name="product-view-mapping"),
]
