import requests
from datetime import date
from .models import Quote
import yfinance as yf
from decimal import Decimal

def update_dollar_quote():
    """
    Consome a AwesomeAPI para buscar a cotação atual do Dólar
    e salva no nosso banco de dados.
    """
    url = "https://economia.awesomeapi.com.br/last/USD-BRL"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # A API retorna 'USDBRL', pegamos o valor de compra (bid)
        price = data['USDBRL']['bid']
        
        # Salva ou atualiza a cotação para o dia de hoje
        quote, created = Quote.objects.update_or_create(
            commodity='USD',
            date=date.today(),
            defaults={'price': price, 'location': None}
        )
        
        return f"Dólar atualizado: R$ {price}"
    except Exception as e:
        return f"Erro ao atualizar Dólar: {str(e)}"
    
def get_latest_dollar():
    """Busca o último dólar salvo no banco para usar na conversão."""
    latest = Quote.objects.filter(commodity='USD').order_by('-date').first()
    if latest:
        return latest.price
    return None

def update_grains_cbot():
    """
    Busca os contratos futuros de Soja e Milho em Chicago,
    converte de US Cents/Bushel para R$/Saca (60kg) e salva no banco.
    """
    dollar_price = get_latest_dollar()
    
    if not dollar_price:
        return "Erro: Cotação do Dólar não encontrada. Atualize o Dólar primeiro."

    # ZS=F (Soja) e ZC=F (Milho)
    tickers = {
        'SOY': {'symbol': 'ZS=F', 'bushels_per_bag': Decimal('2.20462')},
        'CRN': {'symbol': 'ZC=F', 'bushels_per_bag': Decimal('2.36220')}
    }

    resultados = []

    for commodity_code, config in tickers.items():
        try:
            # Baixa os dados do dia de hoje
            ticker_data = yf.Ticker(config['symbol'])
            todays_data = ticker_data.history(period='1d')
            
            if todays_data.empty:
                continue

            # O preço vem em Centavos de Dólar (ex: 1150 = $11.50/bushel)
            price_cents_usd = Decimal(str(todays_data['Close'].iloc[-1]))
            price_usd_per_bushel = price_cents_usd / Decimal('100')
            
            # Converte para R$ por Saca de 60kg
            price_brl_per_bag = price_usd_per_bushel * config['bushels_per_bag'] * dollar_price
            
            # Arredonda para 2 casas decimais
            final_price = round(price_brl_per_bag, 2)

            # Salva no banco de dados (Referência Chicago)
            Quote.objects.update_or_create(
                commodity=commodity_code,
                date=date.today(),
                location='CBOT (Chicago)', # Marcamos a origem para não confundir com o mercado físico
                defaults={'price': final_price}
            )
            
            nome = "Soja" if commodity_code == 'SOY' else "Milho"
            resultados.append(f"{nome} atualizado: R$ {final_price}")

        except Exception as e:
            resultados.append(f"Erro ao buscar {commodity_code}: {str(e)}")

    return " | ".join(resultados)