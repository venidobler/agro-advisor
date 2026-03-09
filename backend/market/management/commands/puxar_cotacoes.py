import requests
from bs4 import BeautifulSoup
from datetime import datetime
from django.core.management.base import BaseCommand
from market.models import MarketPrice, CommodityCategory

class Command(BaseCommand):
    help = 'Robô de scraping para buscar cotações do Sindicato Rural de Toledo'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Iniciando o trator... Ligando o robô de scraping!'))

        url = "https://ruraltoledo.com.br/cotacoes/" 
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            linhas = soup.find_all('div', class_='jet-listing-grid__item')
            
            if not linhas:
                self.stdout.write(self.style.ERROR('Nenhuma linha encontrada.'))
                return

            registros_salvos = 0

            for linha in linhas:
                colunas = linha.find_all('div', class_='jet-listing-dynamic-field__content')
                
                # Pelo nosso Raio-X, a linha completa tem 16 colunas. Vamos garantir que tem pelo menos 15.
                if len(colunas) >= 15:
                    # Lendo os índices exatos que descobrimos no Raio-X
                    milho_str = colunas[0].text.strip() # Col 0: Milho
                    soja_str = colunas[1].text.strip()  # Col 1: Soja
                    trigo_str = colunas[2].text.strip() # Col 2: Trigo
                    
                    # Col 14: Data (vem como "DIA: 09/03/2026", precisamos apagar o "DIA: ")
                    data_str = colunas[14].text.replace('DIA:', '').strip() 

                    try:
                        # Agora sim o Python vai conseguir ler "09/03/2026"
                        data_obj = datetime.strptime(data_str, '%d/%m/%Y').date()

                        def limpa_preco(valor_texto):
                            texto_limpo = valor_texto.replace('R$', '').replace('.', '').replace(',', '.').strip()
                            if not texto_limpo or texto_limpo == '-':
                                return None
                            return float(texto_limpo)

                        preco_milho = limpa_preco(milho_str)
                        preco_soja = limpa_preco(soja_str)
                        preco_trigo = limpa_preco(trigo_str)

                        # Salvando no banco
                        if preco_soja:
                            MarketPrice.objects.update_or_create(commodity=CommodityCategory.SOY, date=data_obj, source="Sindicato Rural de Toledo", defaults={'price': preco_soja})
                        if preco_milho:
                            MarketPrice.objects.update_or_create(commodity=CommodityCategory.CRN, date=data_obj, source="Sindicato Rural de Toledo", defaults={'price': preco_milho})
                        if preco_trigo:
                            MarketPrice.objects.update_or_create(commodity=CommodityCategory.WHT, date=data_obj, source="Sindicato Rural de Toledo", defaults={'price': preco_trigo})
                        
                        # Cada linha tem 3 cotações (Soja, Milho, Trigo), mas contamos como 1 "dia" salvo
                        registros_salvos += 1

                    except ValueError as e:
                        # Se der erro em alguma linha quebrada do site, ele ignora e continua
                        continue
            
            self.stdout.write(self.style.SUCCESS(f'✅ Sucesso! O robô leu e salvou cotações de {registros_salvos} dias diferentes no banco.'))

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'Erro de conexão ao acessar o site: {e}'))