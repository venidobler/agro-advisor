import { useState, useEffect } from "react"
import { Package, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Insumos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Guardamos as fazendas que vêm do Django aqui
  const [fazendas, setFazendas] = useState([])

  const initialFormState = {
    name: "",
    category: "",
    quantity: "",
    unit: "",
    total_cost: "",
    purchase_date: "",
    farm: ""
  }
  const [formData, setFormData] = useState(initialFormState)

  // Busca as fazendas assim que a tela abre para preencher o Select
  useEffect(() => {
    const fetchFazendas = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/management/farms/")
        const data = await response.json()
        setFazendas(data)
      } catch (error) {
        console.error("Erro ao buscar fazendas:", error)
      }
    }
    fetchFazendas()
  }, [])

  const handleOpenCreate = () => {
    setFormData(initialFormState)
    // Se existir pelo menos uma fazenda no banco, já deixa ela pré-selecionada para facilitar a vida do usuário
    if (fazendas.length > 0) {
      setFormData(prev => ({ ...prev, farm: fazendas[0].id.toString() }))
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Peguei a URL exata que estava no seu print do Django REST Framework!
    try {
      const response = await fetch("http://localhost:8000/api/management/inputs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData(initialFormState)
        // Por enquanto, apenas um alerta. Na Issue 6, faremos os cards atualizarem!
        alert("🎉 Insumo cadastrado com sucesso! No próximo passo faremos a lista aparecer na tela.")
      } else {
        console.error("Erro na validação do Django:", await response.json())
      }
    } catch (error) {
      console.error("Erro de conexão:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight transition-colors">Estoque e Insumos</h1>
          <p className="text-muted-foreground mt-1 transition-colors">Gestão de compras, sementes, fertilizantes e defensivos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Nova Compra
          </Button>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Registrar Nova Compra</DialogTitle>
              <DialogDescription>
                Insira os dados do insumo adquirido para adicionar ao seu controle de custos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input id="name" placeholder="Ex: Cloreto de Potássio" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="focus-visible:ring-emerald-500"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                    <SelectTrigger className="focus:ring-emerald-500"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="SEED" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Semente</SelectItem>
                      <SelectItem value="FERTILIZER" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Fertilizante / Adubo</SelectItem>
                      <SelectItem value="PESTICIDE" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Defensivo Químico</SelectItem>
                      <SelectItem value="FUEL" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Combustível</SelectItem>
                      <SelectItem value="OTHER" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade de Medida</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })} required>
                    <SelectTrigger className="focus:ring-emerald-500"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Quilogramas (kg)</SelectItem>
                      <SelectItem value="L" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Litros (L)</SelectItem>
                      <SelectItem value="TON" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Toneladas (ton)</SelectItem>
                      <SelectItem value="SC" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Sacas</SelectItem>
                      <SelectItem value="UNIT" className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">Unidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input id="quantity" type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required className="focus-visible:ring-emerald-500"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_cost">Custo Total (R$)</Label>
                  <Input id="total_cost" type="number" step="0.01" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })} required className="focus-visible:ring-emerald-500"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Data da Compra</Label>
                  <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} required className="focus-visible:ring-emerald-500 dark:[color-scheme:dark]"/>
                </div>
                <div className="space-y-2">
                  <Label>Fazenda</Label>
                  <Select value={formData.farm} onValueChange={(value) => setFormData({ ...formData, farm: value })} required>
                    <SelectTrigger className="focus:ring-emerald-500">
                      <SelectValue placeholder="Selecione a fazenda" />
                    </SelectTrigger>
                    <SelectContent>
                      {fazendas.map((fazenda) => (
                        <SelectItem key={fazenda.id} value={fazenda.id.toString()} className="focus:bg-emerald-500/10 dark:focus:text-emerald-400">
                          {fazenda.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="mt-6 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Compra'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Área de Trabalho (Por enquanto deixamos o Placeholder) */}
      <div className="flex flex-col justify-center items-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-card/50">
        <Package className="w-12 h-12 mb-4 opacity-50" />
        <p>A sua lista de compras e estoque aparecerá aqui.</p>
      </div>

    </div>
  )
}