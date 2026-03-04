import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tractor, Plus, Leaf, Wheat, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Lavouras() {
  // A "memória" do nosso componente
  const [talhoes, setTalhoes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // A função que vai lá no Django buscar os dados
  const fetchTalhoes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/management/cropfields/")
      const data = await response.json()
      setTalhoes(data)
    } catch (error) {
      console.error("Erro ao buscar talhões:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // O gatilho que faz a busca assim que você entra na página
  useEffect(() => {
    fetchTalhoes()
  }, [])

  // Um detalhe de design: Ícone dinâmico dependendo da cultura!
  const getCommodityIcon = (commodity) => {
    if (commodity === 'SOY') return <Leaf className="w-5 h-5 text-emerald-500" />
    if (commodity === 'CRN') return <Wheat className="w-5 h-5 text-amber-500" />
    return <Tractor className="w-5 h-5 text-zinc-500" />
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight transition-colors">Minhas Lavouras</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Gestão de talhões e estimativa de safra</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Novo Talhão
        </Button>
      </div>

      {/* Controle de Tela: Carregando / Vazio / Com Dados */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">
          Sincronizando com a fazenda...
        </div>
      ) : talhoes.length === 0 ? (
        
        /* O "Empty State" bonitão (Se não tiver dados) */
        <Card className="border-zinc-200 dark:border-zinc-800/50 shadow-sm bg-white dark:bg-zinc-900">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 shadow-inner">
              <Tractor className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Nenhum talhão cadastrado</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
              Você ainda não possui lavouras cadastradas. Adicione seu primeiro talhão para começar a projetar sua receita com base no mercado atual.
            </p>
            <Button variant="outline" className="border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
              Cadastrar Primeira Lavoura
            </Button>
          </CardContent>
        </Card>
        
      ) : (
        
        /* A Mágica: O Grid de Cards com os dados do Django! */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talhoes.map((talhao) => (
            <Card key={talhao.id} className="border-zinc-200 dark:border-zinc-800/50 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all bg-white dark:bg-zinc-900 group">
              <CardContent className="p-6">
                
                {/* Título do Card */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {talhao.name}
                    </h3>
                    <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {talhao.farm_name}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                    {getCommodityIcon(talhao.commodity)}
                  </div>
                </div>
                
                {/* Atributos do Talhão */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div>
                    <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Área</p>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-200">{talhao.area_hectares} ha</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Cultura</p>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-200">{talhao.commodity_display}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Status</p>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-200">{talhao.status_display}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Expectativa</p>
                    <p className="font-semibold text-zinc-700 dark:text-zinc-200">{talhao.expected_yield_per_ha ? `${talhao.expected_yield_per_ha} sc/ha` : '---'}</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}