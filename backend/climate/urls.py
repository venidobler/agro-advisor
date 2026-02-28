from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherForecastViewSet

router = DefaultRouter()
router.register(r'weather', WeatherForecastViewSet)

urlpatterns = [
    path('', include(router.urls)),
]