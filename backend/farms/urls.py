from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet, CropFieldViewSet

router = DefaultRouter()
router.register(r'farms', FarmViewSet)
router.register(r'cropfields', CropFieldViewSet)

urlpatterns = [
    path('', include(router.urls)),
]