from django.core.management.base import BaseCommand
from commodities.services import update_dollar_quote, update_grains_cbot

class Command(BaseCommand):
    help = 'Busca cotações atualizadas do Dólar e Grãos (CBOT)'

    def handle(self, *args, **options):
        self.stdout.write("Iniciando atualização de preços...")
        
        # 1. Atualiza o Dólar primeiro (porque os grãos precisam dele)
        res_dollar = update_dollar_quote()
        self.stdout.write(self.style.SUCCESS(f"[1/2] {res_dollar}"))
        
        # 2. Atualiza a Soja e o Milho
        res_grains = update_grains_cbot()
        self.stdout.write(self.style.SUCCESS(f"[2/2] {res_grains}"))
        
        self.stdout.write(self.style.SUCCESS("✅ Todas as cotações foram atualizadas!"))