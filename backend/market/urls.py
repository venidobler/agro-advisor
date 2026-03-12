from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarketPriceViewSet, PortPremiumViewSet

router = DefaultRouter()
# Vai criar a rota /prices/
router.register(r'prices', MarketPriceViewSet)
router.register(r'premiums', PortPremiumViewSet)

urlpatterns = [
    path('', include(router.urls)),

]