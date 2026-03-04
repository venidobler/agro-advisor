import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Leaf, Wheat } from "lucide-react"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useTheme } from "next-themes"

export default function Dashboard() {
    const [quotes, setQuotes] = useState([])
    const [weather, setWeather] = useState([])

    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    useEffect(() => {
        // 1. Definimos a função DENTRO do efeito
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

        // 2. Executamos ela logo em seguida
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

    const chartTextColor = isDark ? '#a1a1aa' : '#52525b'
    const chartGridColor = isDark ? '#27272a' : '#e4e4e7'
    const chartTooltipBg = isDark ? '#18181b' : '#ffffff'

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
        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight transition-colors">Visão Geral</h1>
                    <p className="text-muted-foreground mt-1 transition-colors">Inteligência de Mercado e Clima para Toledo-PR</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* CARDS COM CLASSES SEMÂNTICAS LIMPAS */}
                <Card className="shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Dólar Comercial</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-blue-500">R$</span>
                                    <h3 className="text-4xl font-black text-blue-500 tracking-tight">{kpiUSD.current}</h3>
                                </div>
                                {kpiUSD.hasTrend && (
                                    <div className={`mt-1 text-xs font-bold ${kpiUSD.isEqual ? 'text-muted-foreground' : kpiUSD.isUp ? 'text-blue-500' : 'text-rose-500'}`}>
                                        {kpiUSD.isUp ? '↑' : kpiUSD.isEqual ? '−' : '↓'} {kpiUSD.diffPerc}% ({kpiUSD.isUp ? '+' : kpiUSD.isEqual ? '' : '-'}R$ {kpiUSD.diffValue})
                                    </div>
                                )}
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <DollarSign className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Soja (Saca 60kg)</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-emerald-500">R$</span>
                                    <h3 className="text-4xl font-black text-emerald-500 tracking-tight">{kpiSOY.current}</h3>
                                </div>
                                {kpiSOY.hasTrend && (
                                    <div className={`mt-1 text-xs font-bold ${kpiSOY.isEqual ? 'text-muted-foreground' : kpiSOY.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {kpiSOY.isUp ? '↑' : kpiSOY.isEqual ? '−' : '↓'} {kpiSOY.diffPerc}% ({kpiSOY.isUp ? '+' : kpiSOY.isEqual ? '' : '-'}R$ {kpiSOY.diffValue})
                                    </div>
                                )}
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <Leaf className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Milho (Saca 60kg)</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-amber-500">R$</span>
                                    <h3 className="text-4xl font-black text-amber-500 tracking-tight">{kpiCRN.current}</h3>
                                </div>
                                {kpiCRN.hasTrend && (
                                    <div className={`mt-1 text-xs font-bold ${kpiCRN.isEqual ? 'text-muted-foreground' : kpiCRN.isUp ? 'text-amber-500' : 'text-rose-500'}`}>
                                        {kpiCRN.isUp ? '↑' : kpiCRN.isEqual ? '−' : '↓'} {kpiCRN.diffPerc}% ({kpiCRN.isUp ? '+' : kpiCRN.isEqual ? '' : '-'}R$ {kpiCRN.diffValue})
                                    </div>
                                )}
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Wheat className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm transition-colors">
                    <CardContent className="p-6">
                        {soyQuotes.length > 0 ? (
                            <HighchartsReact highcharts={Highcharts} options={marketChartOptions} />
                        ) : (
                            <div className="h-[350px] flex items-center justify-center text-muted-foreground">Aguardando dados...</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm transition-colors">
                    <CardContent className="p-6">
                        {weather.length > 0 ? (
                            <HighchartsReact highcharts={Highcharts} options={weatherChartOptions} />
                        ) : (
                            <div className="h-[350px] flex items-center justify-center text-muted-foreground">Aguardando radar...</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}