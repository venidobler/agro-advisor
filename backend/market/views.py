from rest_framework import viewsets
from .models import MarketPrice
from .serializers import MarketPriceSerializer

class MarketPriceViewSet(viewsets.ReadOnlyModelViewSet):
    # Traz as cotações mais recentes primeiro
    queryset = MarketPrice.objects.all().order_by('-date')
    serializer_class = MarketPriceSerializer