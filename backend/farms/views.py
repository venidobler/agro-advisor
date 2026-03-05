from rest_framework import viewsets
from .models import Farm, CropField, AgriculturalInput
from .serializers import FarmSerializer, CropFieldSerializer, AgriculturalInputSerializer

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all().order_by('-created_at')
    serializer_class = FarmSerializer

class CropFieldViewSet(viewsets.ModelViewSet):
    queryset = CropField.objects.all().order_by('-created_at')
    serializer_class = CropFieldSerializer

class AgriculturalInputViewSet(viewsets.ModelViewSet):
    # Ordenando pelas compras mais recentes primeiro
    queryset = AgriculturalInput.objects.all().order_by('-purchase_date', '-created_at')
    serializer_class = AgriculturalInputSerializer