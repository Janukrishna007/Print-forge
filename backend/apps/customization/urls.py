from django.urls import path

from .views import CustomizationCreateAPIView, CustomizationResultAPIView, CustomizationStatusAPIView

urlpatterns = [
    path("customize/", CustomizationCreateAPIView.as_view(), name="customize-create"),
    path("customize/<uuid:pk>/status/", CustomizationStatusAPIView.as_view(), name="customize-status"),
    path("customize/<uuid:pk>/result/", CustomizationResultAPIView.as_view(), name="customize-result"),
]
