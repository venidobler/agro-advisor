import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tractor, Plus, Leaf, Wheat, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Lavouras() {
  const [talhoes, setTalhoes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados do Formulário (Modal)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Os dados que o usuário vai preencher (A fazenda eu deixei fixa como 1 por enquanto)
  const [formData, setFormData] = useState({
    name: "",
    commodity: "",
    area_hectares: "",
    planting_date: "",
    expected_yield_per_ha: "",
    status: "PLANNED",
    farm: 1
  })

  // 1. O GET (Busca do Banco)
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

  useEffect(() => {
    fetchTalhoes()
  }, [])

  // 2. O POST (Envia pro Banco)
  const handleSubmit = async (e) => {
    e.preventDefault() // Impede a página de recarregar
    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:8000/api/management/cropfields/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Sucesso! Atualiza a lista, fecha o modal e limpa os campos
        await fetchTalhoes()
        setIsDialogOpen(false)
        setFormData({
          name: "", commodity: "", area_hectares: "", planting_date: "", expected_yield_per_ha: "", status: "PLANNED", farm: 1
        })
      } else {
        console.error("Erro na validação do Django:", await response.json())
      }
    } catch (error) {
      console.error("Erro de conexão:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCommodityIcon = (commodity) => {
    if (commodity === 'SOY') return <Leaf className="w-5 h-5 text-emerald-500" />
    if (commodity === 'CRN') return <Wheat className="w-5 h-5 text-amber-500" />
    return <Tractor className="w-5 h-5 text-zinc-500" />
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Cabeçalho com o Modal (Dialog) Embutido */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight transition-colors">Minhas Lavouras</h1>
          <p className="text-muted-foreground mt-1 transition-colors">Gestão de talhões e estimativa de safra</p>
        </div>

        {/* Aqui começa o Modal do shadcn! */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Novo Talhão
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Cadastrar Lavoura</DialogTitle>
              <DialogDescription>
                Insira os dados do novo talhão. Eles serão sincronizados com o seu painel.
              </DialogDescription>
            </DialogHeader>

            {/* O Formulário de fato */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Talhão</Label>
                <Input
                  id="name"
                  placeholder="Ex: Sede Lado Norte"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="focus-visible:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cultura</Label>
                  <Select
                    value={formData.commodity}
                    onValueChange={(value) => setFormData({ ...formData, commodity: value })}
                    required
                  >
                    <SelectTrigger className="focus:ring-emerald-500">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOY" className="focus:bg-emerald-500/10">Soja</SelectItem>
                      <SelectItem value="CRN" className="focus:bg-emerald-500/10">Milho</SelectItem>
                      <SelectItem value="WHT" className="focus:bg-emerald-500/10">Trigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área (ha)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 50.5"
                    value={formData.area_hectares}
                    onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                    required
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planting_date">Data de Plantio</Label>
                  <Input
                    id="planting_date"
                    type="date"
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    className="focus-visible:ring-emerald-500 dark:[color-scheme:dark]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yield">Expectativa (sc/ha)</Label>
                  <Input
                    id="yield"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 65"
                    value={formData.expected_yield_per_ha}
                    onChange={(e) => setFormData({ ...formData, expected_yield_per_ha: e.target.value })}
                    className="focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Lavoura'}
                </Button>
              </DialogFooter>
            </form>

          </DialogContent>
        </Dialog>
      </div>

      {/* Controle de Tela */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-muted-foreground font-medium animate-pulse">Sincronizando...</div>
      ) : talhoes.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            {/* Empty State Simplificado */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 shadow-inner">
              <Tractor className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum talhão cadastrado</h3>
            <p className="text-muted-foreground max-w-md">
              Você ainda não possui lavouras cadastradas. Adicione seu primeiro talhão para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talhoes.map((talhao) => (
            <Card key={talhao.id} className="shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all group">
              <CardContent className="p-6">

                {/* Título do Card */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {talhao.name}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {talhao.farm_name}
                    </div>
                  </div>
                  {/* Ícone com fundo dinâmico */}
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:bg-emerald-500/10 transition-colors">
                    {getCommodityIcon(talhao.commodity)}
                  </div>
                </div>

                {/* Atributos do Talhão */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
                  <div>
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Área</p>
                    <p className="font-semibold">{talhao.area_hectares} ha</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Cultura</p>
                    <p className="font-semibold">{talhao.commodity_display}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Status</p>
                    <p className="font-semibold">{talhao.status_display}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Expectativa</p>
                    <p className="font-semibold">{talhao.expected_yield_per_ha ? `${talhao.expected_yield_per_ha} sc/ha` : '---'}</p>
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