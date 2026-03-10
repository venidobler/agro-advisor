import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from django.core.management.base import BaseCommand
from market.models import MarketPrice, CommodityCategory
from django.utils import timezone

class Command(BaseCommand):
    help = 'Robô de scraping inteligente (Com Filtro de Sanidade de Datas)'

    def handle(self, *args, **kwargs):
        # A âncora de realidade do robô
        hoje = timezone.now().date()
        
        # Filtro de segurança: pega a data mais recente que NÃO seja no futuro 
        ultimo_registro = MarketPrice.objects.filter(date__lte=hoje).order_by('-date').first()
        data_limite = ultimo_registro.date if ultimo_registro else None

        if data_limite:
            self.stdout.write(self.style.WARNING(f'Iniciando o trator... Temos dados até {data_limite.strftime("%d/%m/%Y")}. Buscando novidades!'))
        else:
            self.stdout.write(self.style.WARNING('Banco vazio. Iniciando carga histórica!'))

        url = "https://ruraltoledo.com.br/cotacoes/"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest'
        }

        dias_processados = set()
        continuar_buscando = True
        pagina_atual = 1 

        while continuar_buscando:
            self.stdout.write(f'Lendo a página {pagina_atual} da API oculta...')
            
            payload = {
                'action': 'jet_engine_ajax', 'handler': 'listing_load_more', 'query[offset]': '0', 'widget_settings[lisitng_id]': '830',
                'widget_settings[posts_num]': '50', 'widget_settings[columns]': '1', 'page_settings[post_id]': 'false',
                'page_settings[queried_id]': '479|WP_Post', 'page_settings[element_id]': 'false', 'page_settings[page]': str(pagina_atual),
                'listing_type': 'false', 'isEditMode': 'false'
            }

            try:
                res_ajax = requests.post(url, data=payload, headers=headers)
                if res_ajax.status_code != 200: 
                    break

                json_data = res_ajax.json()
                if not json_data.get('success') or not json_data.get('data', {}).get('html'): 
                    break
                
                html_content = json_data['data']['html']
                soup = BeautifulSoup(html_content, 'html.parser')
                todas_linhas = soup.find_all('div', class_='jet-listing-grid__item') + soup.find_all('tr')
                
                encontrou_algo_na_pagina = False

                for linha in todas_linhas:
                    colunas = linha.find_all('div', class_='jet-listing-dynamic-field__content') or linha.find_all('td')
                    
                    if len(colunas) >= 5:
                        texto_col0 = colunas[0].text.strip()
                        
                        if re.match(r'^\d{2}/\d{2}/\d{4}$', texto_col0):
                            encontrou_algo_na_pagina = True
                            
                            try:
                                data_obj = datetime.strptime(texto_col0, '%d/%m/%Y').date()

                                # 👇 O FILTRO DE SANIDADE 👇
                                if data_obj > hoje:
                                    self.stdout.write(self.style.ERROR(f'⚠️ Ignorando data absurda digitada pelo Sindicato: {texto_col0}'))
                                    continue

                                # FREIO AUTOMÁTICO
                                if data_limite and data_obj < data_limite:
                                    self.stdout.write(self.style.WARNING('🛑 Chegamos em cotações que já temos. Puxando o freio de mão!'))
                                    continuar_buscando = False
                                    break

                                milho_str, soja_str, trigo_str = colunas[2].text.strip(), colunas[3].text.strip(), colunas[4].text.strip()

                                def limpa_preco(valor_texto):
                                    t = valor_texto.replace('R$', '').replace('.', '').replace(',', '.').strip()
                                    return float(t) if t and t != '-' else None

                                preco_milho, preco_soja, preco_trigo = limpa_preco(milho_str), limpa_preco(soja_str), limpa_preco(trigo_str)

                                if preco_soja: MarketPrice.objects.update_or_create(commodity=CommodityCategory.SOY, date=data_obj, source="Sindicato Rural de Toledo", defaults={'price': preco_soja})
                                if preco_milho: MarketPrice.objects.update_or_create(commodity=CommodityCategory.CRN, date=data_obj, source="Sindicato Rural de Toledo", defaults={'price': preco_milho})
                                if preco_trigo: MarketPrice.objects.update_or_create(commodity=CommodityCategory.WHT, date=data_obj, source="Sindicato Rural de Toledo", defaults={'price': preco_trigo})
                                
                                dias_processados.add(texto_col0)

                            except ValueError:
                                continue
                
                if not encontrou_algo_na_pagina:
                    break
                
                pagina_atual += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Erro durante a requisição: {e}'))
                break
        
        self.stdout.write(self.style.SUCCESS(f'✅ Sincronização concluída com sucesso! {len(dias_processados)} dias processados.'))