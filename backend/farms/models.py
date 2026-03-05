from django.db import models
from django.core.validators import MinValueValidator

class Farm(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nome da Propriedade")
    # Coloquei Toledo, PR como padrão para facilitar a sua vida!
    city = models.CharField(max_length=100, verbose_name="Cidade", default="Toledo")
    state = models.CharField(max_length=2, verbose_name="UF", default="PR")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.city}-{self.state})"

    class Meta:
        verbose_name = "Fazenda"
        verbose_name_plural = "Fazendas"


class CropField(models.Model):
    # As opções de cultura conectadas aos códigos do nosso Dashboard (SOY, CRN)
    COMMODITY_CHOICES = [
        ('SOY', 'Soja'),
        ('CRN', 'Milho'),
        ('WHT', 'Trigo'),
    ]

    STATUS_CHOICES = [
        ('PLANNED', 'Planejado'),
        ('PLANTED', 'Plantado'),
        ('HARVESTED', 'Colhido'),
    ]

    # A mágica do banco relacional: Esse talhão pertence a uma Fazenda
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='fields', verbose_name="Fazenda")
    
    name = models.CharField(max_length=100, verbose_name="Nome do Talhão (ex: Sede Leste)")
    commodity = models.CharField(max_length=3, choices=COMMODITY_CHOICES, verbose_name="Cultura")
    area_hectares = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0.01)], verbose_name="Área (Hectares)")
    
    # Dados Agronômicos
    planting_date = models.DateField(null=True, blank=True, verbose_name="Data de Plantio")
    expected_yield_per_ha = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name="Estimativa de Colheita (Sacas/ha)")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PLANNED', verbose_name="Status da Safra")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.get_commodity_display()} ({self.area_hectares} ha)"

    class Meta:
        verbose_name = "Talhão / Lavoura"
        verbose_name_plural = "Talhões / Lavouras"

class InputCategory(models.TextChoices):
    SEED = 'SEED', 'Semente'
    FERTILIZER = 'FERTILIZER', 'Fertilizante / Adubo'
    PESTICIDE = 'PESTICIDE', 'Defensivo Químico'
    FUEL = 'FUEL', 'Combustível'
    OTHER = 'OTHER', 'Outro'

class UnitType(models.TextChoices):
    KG = 'KG', 'Quilogramas (kg)'
    L = 'L', 'Litros (L)'
    TON = 'TON', 'Toneladas (ton)'
    SC = 'SC', 'Sacas'
    UNIT = 'UNIT', 'Unidade'

class AgriculturalInput(models.Model):
    # Relacionamento com a Fazenda
    farm = models.ForeignKey('Farm', on_delete=models.CASCADE, related_name='inputs', verbose_name="Fazenda")
    
    # Informações do Produto
    name = models.CharField(max_length=255, verbose_name="Nome do Produto") # Ex: Cloreto de Potássio, Glifosato
    category = models.CharField(max_length=20, choices=InputCategory.choices, verbose_name="Categoria")
    
    # Quantidade e Unidade de Medida
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Quantidade") # Ex: 50.5
    unit = models.CharField(max_length=10, choices=UnitType.choices, verbose_name="Unidade") # Ex: TON
    
    # Financeiro
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Custo Total (R$)") # Ex: R$ 150000.00
    purchase_date = models.DateField(verbose_name="Data da Compra")
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.quantity} {self.get_unit_display()} (R$ {self.total_cost})"

    class Meta:
        verbose_name = "Insumo Agrícola"
        verbose_name_plural = "Insumos Agrícolas"