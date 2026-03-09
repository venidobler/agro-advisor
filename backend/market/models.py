from django.db import models

class CommodityCategory(models.TextChoices):
    SOY = 'SOY', 'Soja'
    CRN = 'CRN', 'Milho'
    WHT = 'WHT', 'Trigo'

class MarketPrice(models.Model):
    commodity = models.CharField(max_length=3, choices=CommodityCategory.choices, verbose_name="Cultura")
    date = models.DateField(verbose_name="Data da Cotação")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço (R$)")
    
    # Campo opcional para sabermos se é o preço de "Balcão" (Sindicato/Cooperativa) ou "Bolsa"
    source = models.CharField(max_length=100, default="Sindicato Rural de Toledo", verbose_name="Fonte dos Dados")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cotação de Mercado"
        verbose_name_plural = "Cotações de Mercado"
        # Garante que não teremos duas cotações de Soja no mesmo dia e na mesma fonte
        unique_together = ['commodity', 'date', 'source']

    def __str__(self):
        return f"{self.get_commodity_display()} - {self.date.strftime('%d/%m/%Y')} (R$ {self.price})"