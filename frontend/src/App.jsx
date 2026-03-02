import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
// Importando o Highcharts
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

function App() {
  const [quotes, setQuotes] = useState([])
  const [weather, setWeather] = useState([])

  const fetchDashboardData = async () => {
    try {
      const [quotesRes, weatherRes] = await Promise.all([
        fetch("http://localhost:8000/api/quotes/"),
        fetch("http://localhost:8000/api/weather/")
      ])
      
      const quotesData = await quotesRes.json()
      const weatherData = await weatherRes.json()
      
      setQuotes(quotesData)
      setWeather(weatherData)
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // ==========================================
  // LÓGICA DO GRÁFICO (HIGHCHARTS) - SOJA E MILHO
  // ==========================================
  // 1. Filtra as cotações e inverte para ordem cronológica
  const soyQuotes = quotes.filter(q => q.commodity === 'SOY').reverse()
  const cornQuotes = quotes.filter(q => q.commodity === 'CRN').reverse()
  
  // 2. Extrai as categorias (Eixo X). Usamos as datas da soja como base.
  const chartCategories = soyQuotes.map(q => {
    const [year, month, day] = q.date.split('-')
    return `${day}/${month}`
  })
  
  // Extrai os valores numéricos
  const soyData = soyQuotes.map(q => parseFloat(q.price))
  const cornData = cornQuotes.map(q => parseFloat(q.price))

  // 3. Configuração do visual do Highcharts
  const chartOptions = {
    chart: {
      type: 'spline',
      style: { fontFamily: 'inherit' }
    },
    title: {
      text: 'Evolução de Preços (R$/Saca)',
      style: { fontSize: '16px', fontWeight: 'bold', color: '#334155' }
    },
    xAxis: {
      categories: chartCategories,
      crosshair: true
    },
    yAxis: {
      title: { text: 'Valor (R$)' },
      labels: { format: 'R$ {value}' }
    },
    tooltip: {
      shared: true, // Mostra os dois valores na mesma caixinha ao passar o mouse!
      valuePrefix: 'R$ ',
      valueDecimals: 2
    },
    series: [
      {
        name: 'Soja',
        data: soyData,
        color: '#15803d', // Verde
        marker: { symbol: 'circle' }
      },
      {
        name: 'Milho',
        data: cornData,
        color: '#eab308', // Amarelo/Dourado
        marker: { symbol: 'square' }
      }
    ],
    credits: { enabled: false }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">
            Agro Advisor
          </h1>
          <p className="text-slate-500 mt-1">Painel de Inteligência de Mercado e Clima</p>
        </div>
        <Button onClick={fetchDashboardData} className="bg-green-700 hover:bg-green-800">
          Sincronizar Dados
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">
        
        {/* Coluna 1: Cotações (Mantido igual) */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-100/50 pb-4">
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              📊 Mercado (CBOT & Dólar)
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 h-64 overflow-y-auto">
            {quotes.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Aguardando dados do mercado...</p>
            ) : (
              <ul className="space-y-4">
                {quotes.map((quote) => (
                  <li key={quote.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 block">{quote.commodity_display}</span>
                      <span className="text-xs text-slate-400">{quote.date.split('-').reverse().join('/')} - {quote.location || "Base"}</span>
                    </div>
                    <span className="text-lg font-black text-green-700">
                      R$ {quote.price}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Coluna 2: Clima (Mantido igual) */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-100/50 pb-4">
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              🌦️ Previsão do Tempo (Toledo-PR)
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 h-64 overflow-y-auto">
            {weather.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Aguardando radar meteorológico...</p>
            ) : (
              <ul className="space-y-3">
                {weather.slice(0, 5).map((day) => {
                  const dataFormatada = day.date.split('-').reverse().slice(0, 2).join('/');
                  return (
                    <li key={day.id} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0">
                      <span className="font-semibold text-slate-600 w-16">{dataFormatada}</span>
                      <div className="flex gap-4 text-sm font-medium">
                        <span className="text-blue-500 w-12 text-right">{day.min_temp}°</span>
                        <span className="text-red-500 w-12 text-right">{day.max_temp}°</span>
                      </div>
                      <span className="font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full text-sm">
                        {day.precipitation} mm
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>

      {/* NOVO: Linha do Gráfico Ocupando a Largura Total */}
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            {soyQuotes.length > 0 ? (
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
              />
            ) : (
              <p className="text-slate-400 text-center py-10">Não há histórico de Soja suficiente para gerar o gráfico.</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

export default App