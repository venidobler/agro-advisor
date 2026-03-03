import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { DollarSign, Leaf, Wheat, TrendingUp, TrendingDown, Minus, Moon, Sun } from "lucide-react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-400" />
      <span className="sr-only">Mudar tema</span>
    </Button>
  )
}

function DashboardContent() {
  const [quotes, setQuotes] = useState([])
  const [weather, setWeather] = useState([])
  
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

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

  const getKpiData = (commodityCode) => {
    const history = quotes.filter(q => q.commodity === commodityCode);
    if (history.length === 0) return { current: '---', hasTrend: false };
    const currentPrice = parseFloat(history[0].price);
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

  // Ajuste das cores do gráfico para harmonizar com o ZINC
  const chartTextColor = isDark ? '#a1a1aa' : '#52525b' // zinc-400 / zinc-600
  const chartGridColor = isDark ? '#27272a' : '#e4e4e7' // zinc-800 / zinc-200
  const chartTooltipBg = isDark ? '#18181b' : '#ffffff' // zinc-900 / white

  const soyQuotes = quotes.filter(q => q.commodity === 'SOY').reverse()
  const cornQuotes = quotes.filter(q => q.commodity === 'CRN').reverse()
  const marketCategories = soyQuotes.map(q => q.date.split('-').reverse().slice(0, 2).join('/'))
  const soyData = soyQuotes.map(q => parseFloat(q.price))
  const cornData = cornQuotes.map(q => parseFloat(q.price))

  const marketChartOptions = {
    chart: { type: 'spline', style: { fontFamily: 'inherit' }, height: 350, backgroundColor: 'transparent' },
    title: { text: 'Evolução de Preços (R$/Saca)', style: { fontSize: '16px', fontWeight: 'bold', color: chartTextColor } },
    xAxis: { categories: marketCategories, crosshair: true, labels: { style: { color: chartTextColor } } },
    yAxis: { title: { text: 'Valor (R$)', style: { color: chartTextColor } }, labels: { format: 'R$ {value}', style: { color: chartTextColor } }, gridLineColor: chartGridColor },
    legend: { itemStyle: { color: chartTextColor } },
    tooltip: { shared: true, valuePrefix: 'R$ ', valueDecimals: 2, backgroundColor: chartTooltipBg, style: { color: chartTextColor }, borderColor: chartGridColor },
    series: [
      { name: 'Soja', data: soyData, color: '#10b981', marker: { symbol: 'circle' } },
      { name: 'Milho', data: cornData, color: '#f59e0b', marker: { symbol: 'square' } }
    ],
    credits: { enabled: false }
  }

  const weatherCategories = weather.map(w => w.date.split('-').reverse().slice(0, 2).join('/'))
  const maxTempData = weather.map(w => parseFloat(w.max_temp))
  const minTempData = weather.map(w => parseFloat(w.min_temp))
  const rainData = weather.map(w => parseFloat(w.precipitation))

  const weatherChartOptions = {
    chart: { style: { fontFamily: 'inherit' }, height: 350, backgroundColor: 'transparent' },
    title: { text: 'Previsão do Tempo (7 Dias)', style: { fontSize: '16px', fontWeight: 'bold', color: chartTextColor } },
    xAxis: { categories: weatherCategories, crosshair: true, labels: { style: { color: chartTextColor } } },
    yAxis: [
      { title: { text: 'Temperatura (°C)', style: { color: chartTextColor } }, labels: { format: '{value}°', style: { color: chartTextColor } }, gridLineColor: chartGridColor },
      { title: { text: 'Chuva (mm)', style: { color: chartTextColor } }, labels: { format: '{value} mm', style: { color: chartTextColor } }, opposite: true, gridLineColor: chartGridColor }
    ],
    legend: { itemStyle: { color: chartTextColor } },
    tooltip: { shared: true, backgroundColor: chartTooltipBg, style: { color: chartTextColor }, borderColor: chartGridColor },
    series: [
      { name: 'Chuva', type: 'column', yAxis: 1, data: rainData, color: '#38bdf8', tooltip: { valueSuffix: ' mm' } },
      { name: 'Máx', type: 'spline', data: maxTempData, color: '#ef4444', tooltip: { valueSuffix: '°C' } },
      { name: 'Mín', type: 'spline', data: minTempData, color: '#3b82f6', tooltip: { valueSuffix: '°C' } }
    ],
    credits: { enabled: false }
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      {/* Trocado de slate para zinc. O zinc-950 é um preto/cinza bem neutro */}
      <SidebarInset className="bg-zinc-50 dark:bg-zinc-950 min-h-screen transition-colors duration-300">

        <header className="sticky top-0 flex h-16 w-[calc(100%)] items-center shrink-0 border-b border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-sm z-50 px-4 md:px-6 transition-colors duration-300">
          <div className="flex h-full items-center">
            <SidebarTrigger className="-ml-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg" />
            <div className="hidden md:flex flex-col ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">Visão da Praça</span>
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 leading-none mt-1">Toledo, PR</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ModeToggle />
            {/* Mantive o botão de sincronizar num tom de esmeralda para conectar com a sidebar */}
            <Button onClick={fetchDashboardData} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-md px-4 hidden md:flex border-none">
              Sincronizar
            </Button>
          </div>
        </header>

        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight transition-colors">Visão Geral</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Inteligência de Mercado e Clima para Toledo-PR</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* CARDS COM BORDAS MAIS SUAVES NO DARK MODE (zinc-800/50) */}
            <Card className="border-zinc-200 dark:border-zinc-800/50 shadow-sm bg-white dark:bg-zinc-900 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <p className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Dólar Comercial</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-blue-500 dark:text-blue-400">R$</span>
                      <h3 className="text-4xl font-black text-blue-500 dark:text-blue-400 tracking-tight">{kpiUSD.current}</h3>
                    </div>
                    {kpiUSD.hasTrend && (
                      <div className={`mt-1 text-xs font-bold ${kpiUSD.isEqual ? 'text-zinc-400' : kpiUSD.isUp ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                        {kpiUSD.isUp ? '↑' : kpiUSD.isEqual ? '−' : '↓'} {kpiUSD.diffPerc}% ({kpiUSD.isUp ? '+' : kpiUSD.isEqual ? '' : '-'}R$ {kpiUSD.diffValue})
                      </div>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800/50 shadow-sm bg-white dark:bg-zinc-900 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <p className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Soja (Saca 60kg)</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-emerald-500 dark:text-emerald-400">R$</span>
                      <h3 className="text-4xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight">{kpiSOY.current}</h3>
                    </div>
                    {kpiSOY.hasTrend && (
                      <div className={`mt-1 text-xs font-bold ${kpiSOY.isEqual ? 'text-zinc-400' : kpiSOY.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {kpiSOY.isUp ? '↑' : kpiSOY.isEqual ? '−' : '↓'} {kpiSOY.diffPerc}% ({kpiSOY.isUp ? '+' : kpiSOY.isEqual ? '' : '-'}R$ {kpiSOY.diffValue})
                      </div>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
                    <Leaf className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800/50 shadow-sm bg-white dark:bg-zinc-900 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <p className="text-[11px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Milho (Saca 60kg)</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-amber-500 dark:text-amber-400">R$</span>
                      <h3 className="text-4xl font-black text-amber-500 dark:text-amber-400 tracking-tight">{kpiCRN.current}</h3>
                    </div>
                    {kpiCRN.hasTrend && (
                      <div className={`mt-1 text-xs font-bold ${kpiCRN.isEqual ? 'text-zinc-400' : kpiCRN.isUp ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'}`}>
                        {kpiCRN.isUp ? '↑' : kpiCRN.isEqual ? '−' : '↓'} {kpiCRN.diffPerc}% ({kpiCRN.isUp ? '+' : kpiCRN.isEqual ? '' : '-'}R$ {kpiCRN.diffValue})
                      </div>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center shrink-0">
                    <Wheat className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800/50 dark:bg-zinc-900 transition-colors">
              <CardContent className="p-6">
                {soyQuotes.length > 0 ? (
                  <HighchartsReact highcharts={Highcharts} options={marketChartOptions} />
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">Aguardando dados...</div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800/50 dark:bg-zinc-900 transition-colors">
              <CardContent className="p-6">
                {weather.length > 0 ? (
                  <HighchartsReact highcharts={Highcharts} options={weatherChartOptions} />
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">Aguardando radar...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme" attribute="class">
      <DashboardContent />
    </ThemeProvider>
  )
}