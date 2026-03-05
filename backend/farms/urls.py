from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet, CropFieldViewSet, AgriculturalInputViewSet

router = DefaultRouter()
router.register(r'farms', FarmViewSet)
router.register(r'cropfields', CropFieldViewSet)
router.register(r'inputs', AgriculturalInputViewSet)

urlpatterns = [
    path('', include(router.urls)),
]