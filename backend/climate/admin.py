from django.contrib import admin
from .models import WeatherForecast

@admin.register(WeatherForecast)
class WeatherForecastAdmin(admin.ModelAdmin):
    list_display = ('date', 'precipitation', 'max_temp', 'min_temp', 'updated_at')
    date_hierarchy = 'date'