from rest_framework import viewsets
from .models import Farm, CropField
from .serializers import FarmSerializer, CropFieldSerializer

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all().order_by('-created_at')
    serializer_class = FarmSerializer

class CropFieldViewSet(viewsets.ModelViewSet):
    queryset = CropField.objects.all().order_by('-created_at')
    serializer_class = CropFieldSerializer