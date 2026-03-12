from rest_framework import viewsets
from .models import MarketPrice, PortPremium
from .serializers import MarketPriceSerializer, PortPremiumSerializer

class MarketPriceViewSet(viewsets.ReadOnlyModelViewSet):
    # Traz as cotações mais recentes primeiro
    queryset = MarketPrice.objects.all().order_by('-date')
    serializer_class = MarketPriceSerializer

class PortPremiumViewSet(viewsets.ReadOnlyModelViewSet):
    # Trazemos do mais novo pro mais velho
    queryset = PortPremium.objects.all().order_by('-date', 'shipping_month')
    serializer_class = PortPremiumSerializer