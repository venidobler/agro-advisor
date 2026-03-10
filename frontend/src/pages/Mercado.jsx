import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Wheat, Sprout } from "lucide-react"
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
    const [isLoading, setIsLoading] = useState(true)
    const [period, setPeriod] = useState("30") 

    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/market/prices/")
                const data = await response.json()
                setQuotes(data)
            } catch (error) {
                console.error("Erro ao buscar cotações do mercado:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMarketData()
    }, [])

    const chartTextColor = isDark ? '#a1a1aa' : '#52525b'
    const chartGridColor = isDark ? '#27272a' : '#e4e4e7'
    const chartTooltipBg = isDark ? '#18181b' : '#ffffff'

    // 👇 O NOVO MOTOR DE FILTRO (À PROVA DE FALHAS) 👇
    let filteredQuotes = quotes;
    
    if (period !== "all" && quotes.length > 0) {
        // 1. Acha qual é a cotação mais nova que temos no banco
        const maxDateStr = quotes.reduce((max, q) => q.date > max ? q.date : max, quotes[0].date);
        
        // 2. Transforma em data e subtrai os dias do filtro (7, 30, etc)
        const [maxY, maxM, maxD] = maxDateStr.split('-');
        const anchorDate = new Date(maxY, maxM - 1, maxD);
        anchorDate.setDate(anchorDate.getDate() - parseInt(period));
        
        // 3. Filtra usando a Data Âncora como base
        filteredQuotes = quotes.filter(q => {
            const [y, m, d] = q.date.split('-');
            const quoteDate = new Date(y, m - 1, d);
            return quoteDate >= anchorDate;
        });
    }

    const ascQuotes = [...filteredQuotes].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    const getSeriesData = (commodityCode) => {
        return ascQuotes
            .filter(q => q.commodity === commodityCode)
            .map(q => {
                const [y, m, d] = q.date.split('-');
                const timestamp = Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d));
                return [timestamp, parseFloat(q.price)];
            });
    }

    const marketChartOptions = {
        chart: { type: 'spline', style: { fontFamily: 'inherit' }, height: 400, backgroundColor: 'transparent' },
        title: { text: null }, 
        xAxis: { 
            type: 'datetime',
            labels: { 
                style: { color: chartTextColor },
                format: '{value:%d/%m/%Y}' 
            },
            crosshair: true,
            gridLineColor: chartGridColor
        },
        yAxis: { 
            title: { text: 'Valor da Saca (R$)', style: { color: chartTextColor } }, 
            labels: { format: 'R$ {value}', style: { color: chartTextColor } }, 
            gridLineColor: chartGridColor 
        },
        legend: { itemStyle: { color: chartTextColor } },
        tooltip: { 
            shared: true, 
            valuePrefix: 'R$ ', 
            valueDecimals: 2, 
            backgroundColor: chartTooltipBg, 
            style: { color: chartTextColor }, 
            borderColor: chartGridColor,
            xDateFormat: '%A, %d de %B de %Y' 
        },
        series: [
            // Adicionado marker { enabled: true } para garantir que não suma se tiver poucos dias
            { name: 'Soja', data: getSeriesData('SOY'), color: '#10b981', marker: { enabled: true, symbol: 'circle' } },
            { name: 'Milho', data: getSeriesData('CRN'), color: '#f59e0b', marker: { enabled: true, symbol: 'square' } },
            { name: 'Trigo', data: getSeriesData('WHT'), color: '#eab308', marker: { enabled: true, symbol: 'triangle' } }
        ],
        credits: { enabled: false }
    }

    const getLatestPrice = (commodityCode) => {
        const history = quotes.filter(q => q.commodity === commodityCode)
        return history.length > 0 ? parseFloat(history[0].price).toFixed(2) : '---'
    }

    return (
        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <h1 className="text-4xl font-extrabold tracking-tight transition-colors">Mercado Físico</h1>
                <p className="text-muted-foreground mt-1 transition-colors">Cotações atualizadas do Sindicato Rural de Toledo</p>
            </div>

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

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Histórico de Cotações - Toledo/PR</CardTitle>
                    
                    <div className="w-40">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="focus:ring-emerald-500 bg-secondary/50">
                                <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Últimos 7 dias</SelectItem>
                                <SelectItem value="30" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Últimos 30 dias</SelectItem>
                                <SelectItem value="90" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Últimos 3 meses</SelectItem>
                                <SelectItem value="180" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Últimos 6 meses</SelectItem>
                                <SelectItem value="all" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Todo o Histórico</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    {isLoading ? (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Carregando histórico do mercado...</div>
                    ) : quotes.length > 0 ? (
                        <HighchartsReact highcharts={Highcharts} options={marketChartOptions} />
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-muted-foreground">Nenhum dado encontrado no banco.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}