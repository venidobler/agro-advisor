from rest_framework import viewsets
from .models import WeatherForecast
from .serializers import WeatherForecastSerializer

class WeatherForecastViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para listar as previsões do tempo.
    """
    queryset = WeatherForecast.objects.all().order_by('date')
    serializer_class = WeatherForecastSerializer