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

class PortPremium(models.Model):
    # O prêmio é majoritariamente focado na Soja
    commodity = models.CharField(max_length=3, choices=CommodityCategory.choices, default=CommodityCategory.SOY, verbose_name="Cultura")
    date = models.DateField(verbose_name="Data da Cotação")
    
    # O prêmio pode ser negativo (deságio) ou positivo (ágio), medido em cents de dólar por bushel
    price_cents = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prêmio (Cents/Bushel)")
    
    # Ex: "Maio/26", "Junho/26" - O prêmio sempre é atrelado a um mês de embarque
    shipping_month = models.CharField(max_length=20, verbose_name="Mês de Embarque")
    
    source = models.CharField(max_length=100, default="Notícias Agrícolas - Paranaguá", verbose_name="Fonte")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Prêmio de Exportação"
        verbose_name_plural = "Prêmios de Exportação"
        # Garante que não teremos duas cotações para o mesmo mês de embarque no mesmo dia
        unique_together = ['commodity', 'date', 'shipping_month']

    def __str__(self):
        return f"Prêmio Soja ({self.shipping_month}) - {self.date.strftime('%d/%m/%Y')}: {self.price_cents} cents"