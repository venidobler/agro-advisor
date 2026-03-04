import { Card, CardContent } from "@/components/ui/card"
import { Tractor, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Lavouras() {
  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabeçalho da Página */}
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

      {/* Estado Vazio (Empty State) */}
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

    </div>
  )
}