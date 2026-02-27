from rest_framework import serializers
from .models import Quote

class QuoteSerializer(serializers.ModelSerializer):
    # Isso vai mandar o nome bonito ("Soja") além da sigla ("SOY")
    commodity_display = serializers.CharField(source='get_commodity_display', read_only=True)

    class Meta:
        model = Quote
        fields = ['id', 'commodity', 'commodity_display', 'price', 'date', 'location']