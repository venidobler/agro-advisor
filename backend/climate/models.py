from django.db import models

class WeatherForecast(models.Model):
    date = models.DateField("Data da Previsão", unique=True)
    max_temp = models.DecimalField("Temp. Máxima (°C)", max_digits=5, decimal_places=2)
    min_temp = models.DecimalField("Temp. Mínima (°C)", max_digits=5, decimal_places=2)
    precipitation = models.DecimalField("Chuva (mm)", max_digits=6, decimal_places=2, help_text="Acumulado de chuva no dia")
    
    # Auditoria
    updated_at = models.DateTimeField("Última atualização", auto_now=True)

    class Meta:
        verbose_name = "Previsão do Tempo"
        verbose_name_plural = "Previsões do Tempo"
        ordering = ['date'] # Ordena do dia mais próximo para o mais distante

    def __str__(self):
        return f"{self.date.strftime('%d/%m/%Y')} | Chuva: {self.precipitation}mm | Máx: {self.max_temp}°C"