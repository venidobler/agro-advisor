from rest_framework import serializers
from .models import WeatherForecast

class WeatherForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherForecast
        fields = ['id', 'date', 'max_temp', 'min_temp', 'precipitation', 'updated_at']