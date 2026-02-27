from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Quote
from .serializers import QuoteSerializer

class QuoteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite visualizar as cotações.
    Usamos ReadOnly porque o frontend apenas consome esses dados.
    """
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    
    # Permite filtrar pela URL. Ex: /api/quotes/?commodity=SOY
    filterset_fields = ['commodity', 'location']