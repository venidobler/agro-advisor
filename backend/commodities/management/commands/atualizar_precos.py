from django.core.management.base import BaseCommand
from commodities.services import update_dollar_quote

class Command(BaseCommand):
    help = 'Busca cotações atualizadas de APIs externas'

    def handle(self, *args, **options):
        self.stdout.write("Iniciando atualização de preços...")
        resultado = update_dollar_quote()
        self.stdout.write(self.style.SUCCESS(resultado))