import requests
from datetime import datetime
from .models import WeatherForecast

def update_weather_forecast():
    """
    Busca a previsão do tempo de 7 dias para Toledo/PR usando a API Open-Meteo
    e salva o acumulado de chuva e temperaturas no banco de dados.
    """
    # Coordenadas de Toledo/PR
    lat = "-24.7246"
    lon = "-53.7433"
    
    # URL da Open-Meteo pedindo max, min, chuva e fuso horário de SP
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FSao_Paulo"
    
    try:
        response = requests.get(url)
        response.raise_for_status() # Garante que não deu erro de conexão
        data = response.json()
        
        daily_data = data.get('daily', {})
        dates = daily_data.get('time', [])
        max_temps = daily_data.get('temperature_2m_max', [])
        min_temps = daily_data.get('temperature_2m_min', [])
        precipitations = daily_data.get('precipitation_sum', [])
        
        # Vamos iterar pelos 7 dias que a API retorna
        for i in range(len(dates)):
            # Converte a string "2026-02-28" para um objeto de Data do Python
            date_obj = datetime.strptime(dates[i], '%Y-%m-%d').date()
            
            # Salva ou atualiza a previsão para aquele dia específico
            WeatherForecast.objects.update_or_create(
                date=date_obj,
                defaults={
                    'max_temp': max_temps[i],
                    'min_temp': min_temps[i],
                    'precipitation': precipitations[i]
                }
            )
            
        return f"Previsão de 7 dias atualizada! Chuva hoje: {precipitations[0]}mm"
        
    except Exception as e:
        return f"Erro ao buscar o clima: {str(e)}"