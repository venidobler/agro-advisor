import requests
from datetime import date
from .models import Quote

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