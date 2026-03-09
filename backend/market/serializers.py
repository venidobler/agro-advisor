from rest_framework import serializers
from .models import MarketPrice

class MarketPriceSerializer(serializers.ModelSerializer):
    # Traduz 'SOY' para 'Soja' para o React
    commodity_display = serializers.CharField(source='get_commodity_display', read_only=True)

    class Meta:
        model = MarketPrice
        fields = '__all__'