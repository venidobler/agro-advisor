import { useState, useEffect } from "react"
import { Package, Plus, Loader2, MoreVertical, Trash2, Sprout, Bug, Droplets, TestTube, Box, MapPin, Calendar, Edit } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Insumos() {
    const [insumos, setInsumos] = useState([])
    const [fazendas, setFazendas] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState(null) // <-- Novo estado para controlar a Edição

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    const initialFormState = {
        name: "", category: "", quantity: "", unit: "", total_cost: "", purchase_date: "", farm: ""
    }
    const [formData, setFormData] = useState(initialFormState)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [fazendasRes, insumosRes] = await Promise.all([
                fetch("http://localhost:8000/api/management/farms/"),
                fetch("http://localhost:8000/api/management/inputs/")
            ])
            setFazendas(await fazendasRes.json())
            setInsumos(await insumosRes.json())
        } catch (error) {
            console.error("Erro ao buscar dados:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const formatDate = (dateString) => {
        if (!dateString) return "---"
        const [year, month, day] = dateString.split('-')
        return `${day}/${month}/${year}`
    }

    const getCategoryIcon = (category) => {
        if (category === 'SEED') return <Sprout className="w-5 h-5 text-emerald-500" />
        if (category === 'FERTILIZER') return <TestTube className="w-5 h-5 text-amber-500" />
        if (category === 'PESTICIDE') return <Bug className="w-5 h-5 text-red-500" />
        if (category === 'FUEL') return <Droplets className="w-5 h-5 text-blue-500" />
        return <Box className="w-5 h-5 text-muted-foreground" />
    }

    const handleOpenCreate = () => {
        setFormData(initialFormState)
        setEditingId(null) // Garante que é uma criação
        if (fazendas.length > 0) {
            setFormData(prev => ({ ...prev, farm: fazendas[0].id.toString() }))
        }
        setIsDialogOpen(true)
    }

    // <-- Nova Função de Edição
    const handleOpenEdit = (insumo) => {
        setFormData({
            name: insumo.name,
            category: insumo.category,
            quantity: insumo.quantity,
            unit: insumo.unit,
            total_cost: insumo.total_cost,
            purchase_date: insumo.purchase_date,
            farm: insumo.farm.toString() // Select exige string
        })
        setEditingId(insumo.id)
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Decidindo a URL e o Método com base no estado de edição
        const url = editingId
            ? `http://localhost:8000/api/management/inputs/${editingId}/`
            : "http://localhost:8000/api/management/inputs/"

        const method = editingId ? "PUT" : "POST"

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                await fetchData()
                setIsDialogOpen(false)
                setFormData(initialFormState)
                setEditingId(null)
            } else {
                console.error("Erro na validação do Django:", await response.json())
            }
        } catch (error) {
            console.error("Erro de conexão:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleOpenDelete = (id) => {
        setDeletingId(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deletingId) return
        try {
            const response = await fetch(`http://localhost:8000/api/management/inputs/${deletingId}/`, {
                method: "DELETE",
            })
            if (response.ok) {
                await fetchData()
            } else {
                console.error("Erro ao excluir no Django")
            }
        } catch (error) {
            console.error("Erro de conexão:", error)
        } finally {
            setIsDeleteDialogOpen(false)
            setDeletingId(null)
        }
    }

    return (
        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

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
                            <DialogTitle className="text-xl font-bold">
                                {editingId ? "Editar Compra" : "Registrar Nova Compra"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingId
                                    ? "Ajuste os valores ou as datas do insumo."
                                    : "Insira os dados do insumo adquirido para adicionar ao seu controle de custos."}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input id="name" placeholder="Ex: Cloreto de Potássio" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="focus-visible:ring-emerald-500" />
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
                                    <Input id="quantity" type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required className="focus-visible:ring-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total_cost">Custo Total (R$)</Label>
                                    <Input id="total_cost" type="number" step="0.01" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })} required className="focus-visible:ring-emerald-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase_date">Data da Compra</Label>
                                    <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} required className="focus-visible:ring-emerald-500 dark:[color-scheme:dark]" />
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
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingId ? 'Salvar Alterações' : 'Salvar Compra'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir registro de compra?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação não pode ser desfeita. O custo deste insumo será removido permanentemente do seu histórico financeiro.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Sim, excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isLoading ? (
                <div className="flex justify-center items-center h-64 text-muted-foreground font-medium animate-pulse">Carregando estoque...</div>
            ) : insumos.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-card/50">
                    <Package className="w-12 h-12 mb-4 opacity-50" />
                    <p>Nenhuma compra registrada. Seu estoque está vazio.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insumos.map((insumo) => (
                        <Card key={insumo.id} className="shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all group flex flex-col h-full">
                            <CardContent className="p-6 flex-1 flex flex-col">

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {insumo.name}
                                        </h3>
                                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {insumo.farm_name}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:bg-emerald-500/10 transition-colors">
                                            {getCategoryIcon(insumo.category)}
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                {/* BOTÃO DE EDITAR ADICIONADO AQUI 👇 */}
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(insumo)}>
                                                    <Edit className="mr-2 h-4 w-4" /><span>Editar</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400" onClick={() => handleOpenDelete(insumo.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /><span>Excluir</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border flex-1">
                                    <div>
                                        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Categoria</p>
                                        <p className="font-semibold text-sm truncate">{insumo.category_display}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Quantidade</p>
                                        <p className="font-semibold text-sm">{insumo.quantity} {insumo.unit_display}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Data da Compra
                                        </p>
                                        <p className="font-semibold text-sm">{formatDate(insumo.purchase_date)}</p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-dashed border-border flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 -mx-6 -mb-6 p-6 rounded-b-xl">
                                    <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest">Custo Total</span>
                                    <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(insumo.total_cost)}
                                    </span>
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}