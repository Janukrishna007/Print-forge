from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomizationJob
from .serializers import CustomizationCreateSerializer, CustomizationJobSerializer
from .tasks import render_customization_task


@method_decorator(csrf_exempt, name="dispatch")
class CustomizationCreateAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = CustomizationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        print_size_multiplier = validated["print_size"] / 100.0

        job = CustomizationJob.objects.create(
            product=validated["product"],
            product_view=validated["product_view"],
            design_upload=validated["design"],
            parameters={
                "scale": validated["scale"] * print_size_multiplier,
                "offset_x": validated["offset_x"],
                "offset_y": validated["offset_y"],
                "opacity": validated["opacity"],
                "blend_mode": validated["blend_mode"],
                "print_size": validated["print_size"],
            },
        )
        render_customization_task.delay(str(job.id))

        return Response({"id": job.id, "status": job.status, "progress": job.progress}, status=status.HTTP_202_ACCEPTED)


@method_decorator(csrf_exempt, name="dispatch")
class CustomizationStatusAPIView(generics.RetrieveAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    queryset = CustomizationJob.objects.select_related("product", "product_view")
    serializer_class = CustomizationJobSerializer
    lookup_field = "pk"


@method_decorator(csrf_exempt, name="dispatch")
class CustomizationResultAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    def get(self, request, pk, *args, **kwargs):
        job = generics.get_object_or_404(CustomizationJob, pk=pk)
        serializer = CustomizationJobSerializer(job, context={"request": request})
        if job.status != CustomizationJob.STATUS_COMPLETED or not job.result_image:
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.data)
