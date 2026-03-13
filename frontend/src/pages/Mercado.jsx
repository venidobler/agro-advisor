import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Wheat, Sprout, Anchor } from "lucide-react"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useTheme } from "next-themes"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Mercado() {
    const [quotes, setQuotes] = useState([])
    const [premiums, setPremiums] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [period, setPeriod] = useState("30") 

    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                // Dispara as duas requisições ao mesmo tempo (Paralelo)
                const [quotesRes, premiumsRes] = await Promise.all([
                    fetch("http://localhost:8000/api/market/prices/"),
                    fetch("http://localhost:8000/api/market/premiums/")
                ])
                
                setQuotes(await quotesRes.json())
                setPremiums(await premiumsRes.json())
            } catch (error) {
                console.error("Erro ao buscar dados do mercado:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMarketData()
    }, [])

    const chartTextColor = isDark ? '#a1a1aa' : '#52525b'
    const chartGridColor = isDark ? '#27272a' : '#e4e4e7'
    const chartTooltipBg = isDark ? '#18181b' : '#ffffff'

    // ==========================================
    // 1. LÓGICA DO GRÁFICO DE COTAÇÕES (TOLEDO)
    // ==========================================
    let filteredQuotes = quotes;
    if (period !== "all" && quotes.length > 0) {
        const maxDateStr = quotes.reduce((max, q) => q.date > max ? q.date : max, quotes[0].date);
        const [maxY, maxM, maxD] = maxDateStr.split('-');
        const anchorDate = new Date(maxY, maxM - 1, maxD);
        anchorDate.setDate(anchorDate.getDate() - parseInt(period));
        
        filteredQuotes = quotes.filter(q => {
            const [y, m, d] = q.date.split('-');
            const quoteDate = new Date(y, m - 1, d);
            return quoteDate >= anchorDate;
        });
    }

    const ascQuotes = [...filteredQuotes].sort((a, b) => new Date(a.date) - new Date(b.date));

    const getQuoteSeriesData = (commodityCode) => {
        return ascQuotes
            .filter(q => q.commodity === commodityCode)
            .map(q => {
                const [y, m, d] = q.date.split('-');
                return [Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d)), parseFloat(q.price)];
            });
    }

    const marketChartOptions = {
        chart: { type: 'spline', style: { fontFamily: 'inherit' }, height: 400, backgroundColor: 'transparent' },
        title: { text: null }, 
        xAxis: { type: 'datetime', labels: { style: { color: chartTextColor }, format: '{value:%d/%m/%Y}' }, crosshair: true, gridLineColor: chartGridColor },
        yAxis: { title: { text: 'Valor da Saca (R$)', style: { color: chartTextColor } }, labels: { format: 'R$ {value}', style: { color: chartTextColor } }, gridLineColor: chartGridColor },
        legend: { itemStyle: { color: chartTextColor } },
        tooltip: { shared: true, valuePrefix: 'R$ ', valueDecimals: 2, backgroundColor: chartTooltipBg, style: { color: chartTextColor }, borderColor: chartGridColor, xDateFormat: '%A, %d de %B de %Y' },
        series: [
            { name: 'Soja', data: getQuoteSeriesData('SOY'), color: '#10b981', marker: { enabled: true, symbol: 'circle' } },
            { name: 'Milho', data: getQuoteSeriesData('CRN'), color: '#f59e0b', marker: { enabled: true, symbol: 'square' } },
            { name: 'Trigo', data: getQuoteSeriesData('WHT'), color: '#eab308', marker: { enabled: true, symbol: 'triangle' } }
        ],
        credits: { enabled: false }
    }

    // ==========================================
    // 2. LÓGICA DO GRÁFICO DE PRÊMIO (PARANAGUÁ)
    // ==========================================
    let filteredPremiums = premiums;
    if (period !== "all" && premiums.length > 0) {
        const maxDateStr = premiums.reduce((max, p) => p.date > max ? p.date : max, premiums[0].date);
        const [maxY, maxM, maxD] = maxDateStr.split('-');
        const anchorDate = new Date(maxY, maxM - 1, maxD);
        anchorDate.setDate(anchorDate.getDate() - parseInt(period));
        
        filteredPremiums = premiums.filter(p => {
            const [y, m, d] = p.date.split('-');
            const premiumDate = new Date(y, m - 1, d);
            return premiumDate >= anchorDate;
        });
    }

    const ascPremiums = [...filteredPremiums].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Descobre todos os meses de embarque únicos que vieram no banco
    const uniqueShippingMonths = [...new Set(ascPremiums.map(p => p.shipping_month))];

    const premiumSeriesData = uniqueShippingMonths.map(month => {
        const dataForMonth = ascPremiums
            .filter(p => p.shipping_month === month)
            .map(p => {
                const [y, m, d] = p.date.split('-');
                return [Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d)), parseFloat(p.price_cents)];
            });
        
        return {
            name: `Embarque ${month}`,
            data: dataForMonth,
            marker: { enabled: true, symbol: 'circle' }
        };
    });

    const premiumChartOptions = {
        chart: { type: 'spline', style: { fontFamily: 'inherit' }, height: 350, backgroundColor: 'transparent' },
        title: { text: null }, 
        xAxis: { type: 'datetime', labels: { style: { color: chartTextColor }, format: '{value:%d/%m/%Y}' }, crosshair: true, gridLineColor: chartGridColor },
        yAxis: { 
            title: { text: 'Cents de Dólar / Bushel', style: { color: chartTextColor } }, 
            labels: { format: '{value} ¢', style: { color: chartTextColor } }, 
            gridLineColor: chartGridColor,
            plotLines: [{ value: 0, color: chartTextColor, width: 2, dashStyle: 'dash', zIndex: 4 }] // Linha do Zero
        },
        legend: { itemStyle: { color: chartTextColor } },
        tooltip: { shared: true, valueSuffix: ' ¢/bu', valueDecimals: 2, backgroundColor: chartTooltipBg, style: { color: chartTextColor }, borderColor: chartGridColor, xDateFormat: '%A, %d de %B de %Y' },
        series: premiumSeriesData,
        credits: { enabled: false }
    }

    // ==========================================
    // UTILITÁRIOS
    // ==========================================
    const getLatestPrice = (commodityCode) => {
        const history = quotes.filter(q => q.commodity === commodityCode)
        return history.length > 0 ? parseFloat(history[0].price).toFixed(2) : '---'
    }

    return (
        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabeçalho com Filtro Global */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight transition-colors">Mercado Físico</h1>
                    <p className="text-muted-foreground mt-1 transition-colors">Inteligência de Comercialização Agrícola</p>
                </div>
                <div className="w-40 shrink-0">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="focus:ring-emerald-500 bg-secondary/50">
                            <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Últimos 7 dias</SelectItem>
                            <SelectItem value="30" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Últimos 30 dias</SelectItem>
                            <SelectItem value="90" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Últimos 3 meses</SelectItem>
                            <SelectItem value="all" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Todo o Histórico</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Cards de Cotação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Soja (Saca 60kg)</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-emerald-500">R$</span>
                                    <h3 className="text-4xl font-black text-emerald-500 tracking-tight">{getLatestPrice('SOY')}</h3>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <Leaf className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Milho (Saca 60kg)</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-amber-500">R$</span>
                                    <h3 className="text-4xl font-black text-amber-500 tracking-tight">{getLatestPrice('CRN')}</h3>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Wheat className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Trigo (Saca 60kg)</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl font-bold text-yellow-500">R$</span>
                                    <h3 className="text-4xl font-black text-yellow-500 tracking-tight">{getLatestPrice('WHT')}</h3>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                                <Sprout className="w-6 h-6 text-yellow-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grids de Gráficos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Preços de Balcão (Toledo/PR)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {isLoading ? (
                            <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Carregando cotações...</div>
                        ) : quotes.length > 0 ? (
                            <HighchartsReact highcharts={Highcharts} options={marketChartOptions} />
                        ) : (
                            <div className="h-[400px] flex items-center justify-center text-muted-foreground">Sem dados de balcão.</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Prêmio de Exportação Soja (Paranaguá/PR)</CardTitle>
                        <Anchor className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {isLoading ? (
                            <div className="h-[350px] flex items-center justify-center text-muted-foreground animate-pulse">Consultando o porto...</div>
                        ) : premiums.length > 0 ? (
                            <HighchartsReact highcharts={Highcharts} options={premiumChartOptions} />
                        ) : (
                            <div className="h-[350px] flex items-center justify-center text-muted-foreground">O porto está fechado. Sem dados de prêmio.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}