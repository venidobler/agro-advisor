from django.core.management.base import BaseCommand
from climate.services import update_weather_forecast

class Command(BaseCommand):
    help = 'Busca a previsão do tempo via Open-Meteo'

    def handle(self, *args, **options):
        self.stdout.write("Atualizando Previsão do Tempo...")
        
        res_weather = update_weather_forecast()
        self.stdout.write(self.style.SUCCESS(f"[Clima] {res_weather}"))