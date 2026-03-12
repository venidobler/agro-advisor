import requests
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from market.models import PortPremium, CommodityCategory
from django.utils import timezone

class Command(BaseCommand):
    help = 'Robô de scraping para buscar o Prêmio da Soja no Porto de Paranaguá'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('⚓ Iniciando o trator marítimo... Rumo ao Porto de Paranaguá!'))

        url = "https://www.noticiasagricolas.com.br/cotacoes/soja/premio-soja-paranagua-pr"
        
        # O "Disfarce": Fingindo ser um navegador real que clicou em um link do Google
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.google.com/'
        }

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Verifica se fomos pegos pela barreira do Cloudflare
            titulo = soup.title.text.strip() if soup.title else ""
            if "Just a moment" in titulo or "Cloudflare" in titulo or "Attention" in titulo:
                self.stdout.write(self.style.ERROR('❌ Fomos barrados pela alfândega (Proteção Cloudflare).'))
                return

            # Busca "cega": varre qualquer tabela na página que tenha as colunas do prêmio
            tabela = None
            for tbl in soup.find_all('table'):
                texto_tabela = tbl.text.lower()
                if 'mês' in texto_tabela and ('us$' in texto_tabela or 'variação' in texto_tabela):
                    tabela = tbl
                    break

            if not tabela:
                self.stdout.write(self.style.ERROR(f'❌ Tabela não encontrada. O site carregou a página: "{titulo}"'))
                return

            # Extrai as linhas (verificando se existe a tag tbody)
            linhas = tabela.find('tbody').find_all('tr') if tabela.find('tbody') else tabela.find_all('tr')
            hoje = timezone.now().date()
            salvos = 0

            for linha in linhas:
                colunas = linha.find_all('td')
                
                if len(colunas) >= 2:
                    mes_embarque = colunas[0].text.strip()
                    valor_texto = colunas[1].text.strip() 

                    # Pula o cabeçalho caso ele caia no loop
                    if mes_embarque.lower() == 'mês':
                        continue

                    # Extrai só os números (mesmo que venha com texto sujo na frente)
                    match = re.search(r'[-+]?\d+(?:,\d+)?', valor_texto)
                    
                    if match:
                        valor_limpo = match.group(0).replace(',', '.')
                        preco_cents = float(valor_limpo)

                        PortPremium.objects.update_or_create(
                            commodity=CommodityCategory.SOY,
                            date=hoje,
                            shipping_month=mes_embarque,
                            defaults={'price_cents': preco_cents, 'source': 'Notícias Agrícolas'}
                        )
                        salvos += 1

            self.stdout.write(self.style.SUCCESS(f'✅ Atracado com sucesso! {salvos} meses de embarque registrados para o dia de hoje.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Erro de conexão no porto: {e}'))