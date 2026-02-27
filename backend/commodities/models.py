from django.db import models

class Quote(models.Model):
    # Opções fixas para o tipo de commodity
    COMMODITY_CHOICES = [
        ('SOY', 'Soja'),
        ('CRN', 'Milho'),
        ('USD', 'Dólar'),
    ]

    commodity = models.CharField("Commodity", max_length=3, choices=COMMODITY_CHOICES)
    price = models.DecimalField("Preço (R$)", max_digits=10, decimal_places=2)
    date = models.DateField("Data da Cotação")
    location = models.CharField(
        "Localização", 
        max_length=100, 
        blank=True, 
        null=True, 
        help_text="Ex: Toledo, Cascavel (Deixe em branco para cotações gerais como o Dólar)"
    )
    
    # Auditoria automática
    created_at = models.DateTimeField("Registrado em", auto_now_add=True)

    class Meta:
        verbose_name = "Cotação"
        verbose_name_plural = "Cotações"
        ordering = ['-date', 'commodity'] # Ordena da mais recente para a mais antiga

    def __str__(self):
        local = f" - {self.location}" if self.location else ""
        return f"{self.get_commodity_display()} | R$ {self.price} ({self.date.strftime('%d/%m/%Y')}){local}"