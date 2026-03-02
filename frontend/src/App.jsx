import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { DollarSign, Leaf, Wheat, TrendingUp, TrendingDown, Minus } from "lucide-react"

function App() {
  const [quotes, setQuotes] = useState([])
  const [weather, setWeather] = useState([])

  const fetchDashboardData = async () => {
    try {
      const [quotesRes, weatherRes] = await Promise.all([
        fetch("http://localhost:8000/api/quotes/"),
        fetch("http://localhost:8000/api/weather/")
      ])
      setQuotes(await quotesRes.json())
      setWeather(await weatherRes.json())
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // ==========================================
  // 1. LÓGICA DOS CARDS DE TOPO (KPIs com Tendência)
  // ==========================================
  const getKpiData = (commodityCode) => {
    // Filtra o histórico da commodity específica
    const history = quotes.filter(q => q.commodity === commodityCode);
    
    // Se não tem nada, retorna vazio
    if (history.length === 0) return { current: '---', hasTrend: false };
    
    const currentPrice = parseFloat(history[0].price);
    
    // Se só tem 1 dia de dado, não tem como comparar com ontem
    if (history.length < 2) return { current: currentPrice.toFixed(2), hasTrend: false };

    const previousPrice = parseFloat(history[1].price);
    const diffValue = currentPrice - previousPrice;
    const diffPerc = (diffValue / previousPrice) * 100;

    return {
      current: currentPrice.toFixed(2),
      diffValue: Math.abs(diffValue).toFixed(2),
      diffPerc: Math.abs(diffPerc).toFixed(2),
      isUp: diffValue > 0,
      isDown: diffValue < 0,
      isEqual: diffValue === 0,
      hasTrend: true
    };
  };

  const kpiUSD = getKpiData('USD');
  const kpiSOY = getKpiData('SOY');
  const kpiCRN = getKpiData('CRN');

  // ==========================================
  // 2. GRÁFICO DE MERCADO (SOJA E MILHO)
  // ==========================================
  const soyQuotes = quotes.filter(q => q.commodity === 'SOY').reverse()
  const cornQuotes = quotes.filter(q => q.commodity === 'CRN').reverse()
  
  const marketCategories = soyQuotes.map(q => q.date.split('-').reverse().slice(0, 2).join('/'))
  const soyData = soyQuotes.map(q => parseFloat(q.price))
  const cornData = cornQuotes.map(q => parseFloat(q.price))

  const marketChartOptions = {
    chart: { type: 'spline', style: { fontFamily: 'inherit' }, height: 350 },
    title: { text: 'Evolução de Preços (R$/Saca)', style: { fontSize: '16px', fontWeight: 'bold', color: '#334155' } },
    xAxis: { categories: marketCategories, crosshair: true },
    yAxis: { title: { text: 'Valor (R$)' }, labels: { format: 'R$ {value}' } },
    tooltip: { shared: true, valuePrefix: 'R$ ', valueDecimals: 2 },
    series: [
      { name: 'Soja', data: soyData, color: '#15803d', marker: { symbol: 'circle' } },
      { name: 'Milho', data: cornData, color: '#eab308', marker: { symbol: 'square' } }
    ],
    credits: { enabled: false }
  }

  // ==========================================
  // 3. GRÁFICO DE CLIMA (TEMPERATURA E CHUVA)
  // ==========================================
  const weatherCategories = weather.map(w => w.date.split('-').reverse().slice(0, 2).join('/'))
  const maxTempData = weather.map(w => parseFloat(w.max_temp))
  const minTempData = weather.map(w => parseFloat(w.min_temp))
  const rainData = weather.map(w => parseFloat(w.precipitation))

  const weatherChartOptions = {
    chart: { style: { fontFamily: 'inherit' }, height: 350 },
    title: { text: 'Previsão do Tempo (7 Dias)', style: { fontSize: '16px', fontWeight: 'bold', color: '#334155' } },
    xAxis: { categories: weatherCategories, crosshair: true },
    // EIXO Y DUPLO: Chuva de um lado, Temperatura do outro!
    yAxis: [
      { title: { text: 'Temperatura (°C)' }, labels: { format: '{value}°' } },
      { title: { text: 'Chuva (mm)' }, labels: { format: '{value} mm' }, opposite: true }
    ],
    tooltip: { shared: true },
    series: [
      // Chuva como Colunas (Barras)
      { name: 'Chuva', type: 'column', yAxis: 1, data: rainData, color: '#38bdf8', tooltip: { valueSuffix: ' mm' } },
      // Temperaturas como Linhas
      { name: 'Máx', type: 'spline', data: maxTempData, color: '#ef4444', tooltip: { valueSuffix: '°C' } },
      { name: 'Mín', type: 'spline', data: minTempData, color: '#3b82f6', tooltip: { valueSuffix: '°C' } }
    ],
    credits: { enabled: false }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">Agro Advisor</h1>
          <p className="text-slate-500 mt-1">Painel de Inteligência de Mercado e Clima</p>
        </div>
        <Button onClick={fetchDashboardData} className="bg-green-700 hover:bg-green-800">
          Sincronizar Dados
        </Button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* LINHA 1: Cards de KPI (Estilo Dashboard Analítico Avançado) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Card Dólar */}
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                
                {/* Esquerda: Título, Preço e Tendência */}
                <div className="flex flex-col">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Dólar Comercial
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-sky-500">R$</span>
                    <h3 className="text-4xl font-black text-sky-500 tracking-tight">
                      {kpiUSD.current}
                    </h3>
                  </div>
                  {kpiUSD.hasTrend && (
                    <div className={`mt-1 text-xs font-bold ${kpiUSD.isEqual ? 'text-slate-400' : kpiUSD.isUp ? 'text-sky-600' : 'text-rose-500'}`}>
                      {kpiUSD.isUp ? '↑' : kpiUSD.isEqual ? '−' : '↓'} {kpiUSD.diffPerc}% ({kpiUSD.isUp ? '+' : kpiUSD.isEqual ? '' : '-'}R$ {kpiUSD.diffValue})
                    </div>
                  )}
                </div>

                {/* Direita: Ícone */}
                <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-sky-500" />
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Card Soja */}
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                
                <div className="flex flex-col">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Soja (Saca 60kg)
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-emerald-500">R$</span>
                    <h3 className="text-4xl font-black text-emerald-500 tracking-tight">
                      {kpiSOY.current}
                    </h3>
                  </div>
                  {kpiSOY.hasTrend && (
                    <div className={`mt-1 text-xs font-bold ${kpiSOY.isEqual ? 'text-slate-400' : kpiSOY.isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {kpiSOY.isUp ? '↑' : kpiSOY.isEqual ? '−' : '↓'} {kpiSOY.diffPerc}% ({kpiSOY.isUp ? '+' : kpiSOY.isEqual ? '' : '-'}R$ {kpiSOY.diffValue})
                    </div>
                  )}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6 text-emerald-500" />
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Card Milho */}
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                
                <div className="flex flex-col">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Milho (Saca 60kg)
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-amber-500">R$</span>
                    <h3 className="text-4xl font-black text-amber-500 tracking-tight">
                      {kpiCRN.current}
                    </h3>
                  </div>
                  {kpiCRN.hasTrend && (
                    <div className={`mt-1 text-xs font-bold ${kpiCRN.isEqual ? 'text-slate-400' : kpiCRN.isUp ? 'text-amber-600' : 'text-rose-500'}`}>
                      {kpiCRN.isUp ? '↑' : kpiCRN.isEqual ? '−' : '↓'} {kpiCRN.diffPerc}% ({kpiCRN.isUp ? '+' : kpiCRN.isEqual ? '' : '-'}R$ {kpiCRN.diffValue})
                    </div>
                  )}
                </div>

                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Wheat className="w-6 h-6 text-amber-500" />
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* LINHA 2: Gráficos (2 Colunas) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico de Mercado */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              {soyQuotes.length > 0 ? (
                <HighchartsReact highcharts={Highcharts} options={marketChartOptions} />
              ) : (
                <div className="h-[350px] flex items-center justify-center text-slate-400">
                  Aguardando dados históricos...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Clima */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              {weather.length > 0 ? (
                <HighchartsReact highcharts={Highcharts} options={weatherChartOptions} />
              ) : (
                <div className="h-[350px] flex items-center justify-center text-slate-400">
                  Aguardando radar meteorológico...
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default App