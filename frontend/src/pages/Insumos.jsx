import { Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Insumos() {
  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight transition-colors">Estoque e Insumos</h1>
          <p className="text-muted-foreground mt-1 transition-colors">Gestão de compras, sementes, fertilizantes e defensivos</p>
        </div>
        
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Nova Compra
        </Button>
      </div>

      {/* Área de Trabalho (Placeholder) */}
      <div className="flex flex-col justify-center items-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-card/50">
        <Package className="w-12 h-12 mb-4 opacity-50" />
        <p>A sua lista de compras e estoque aparecerá aqui.</p>
      </div>

    </div>
  )
}