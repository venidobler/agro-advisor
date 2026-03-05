from rest_framework import serializers
from .models import Farm, CropField, AgriculturalInput

class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = '__all__'

class CropFieldSerializer(serializers.ModelSerializer):
    # Esses campos 'read_only' são um truque de Mestre para mandar o nome amigável para o React
    # em vez de mandar só a sigla "SOY" ou o ID da fazenda.
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    commodity_display = serializers.CharField(source='get_commodity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CropField
        fields = '__all__'

class AgriculturalInputSerializer(serializers.ModelSerializer):
    # Aplicando o mesmo truque para o módulo de Insumos!
    farm_name = serializers.CharField(source='farm.name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)

    class Meta:
        model = AgriculturalInput
        fields = '__all__'