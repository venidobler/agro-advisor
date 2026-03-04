import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tractor, Plus, Leaf, Wheat, Sprout, MapPin, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react"
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

export default function Lavouras() {
    const [talhoes, setTalhoes] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Estados do Modal de Formulário (Criar/Editar)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState(null) // <-- Guarda o ID se estivermos editando

    // Estados do Modal de Exclusão
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    // O Estado inicial limpo
    const initialFormState = {
        name: "", commodity: "", area_hectares: "", planting_date: "", expected_yield_per_ha: "", status: "PLANNED", farm: 1
    }
    const [formData, setFormData] = useState(initialFormState)

    // 1. GET (Buscar Todos)
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

    // Função para abrir o modal de criar limpo
    const handleOpenCreate = () => {
        setFormData(initialFormState)
        setEditingId(null)
        setIsDialogOpen(true)
    }

    // Função para abrir o modal de edição preenchido
    const handleOpenEdit = (talhao) => {
        setFormData({
            name: talhao.name,
            commodity: talhao.commodity,
            area_hectares: talhao.area_hectares,
            planting_date: talhao.planting_date || "",
            expected_yield_per_ha: talhao.expected_yield_per_ha || "",
            status: talhao.status,
            farm: talhao.farm // O ID da fazenda (provavelmente 1)
        })
        setEditingId(talhao.id)
        setIsDialogOpen(true)
    }

    // 2. POST ou PUT (Salvar Formulário)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Se tiver editingId é PUT (Atualizar), senão é POST (Criar)
        const url = editingId
            ? `http://localhost:8000/api/management/cropfields/${editingId}/`
            : "http://localhost:8000/api/management/cropfields/"

        const method = editingId ? "PUT" : "POST"

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                await fetchTalhoes()
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

    // Função para preparar a exclusão
    const handleOpenDelete = (id) => {
        setDeletingId(id)
        setIsDeleteDialogOpen(true)
    }

    // 3. DELETE (Excluir de Fato)
    const confirmDelete = async () => {
        if (!deletingId) return

        try {
            const response = await fetch(`http://localhost:8000/api/management/cropfields/${deletingId}/`, {
                method: "DELETE",
            })

            if (response.ok) {
                await fetchTalhoes()
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

    const getCommodityIcon = (commodity) => {
        if (commodity === 'SOY') return <Leaf className="w-5 h-5 text-emerald-500" />
        if (commodity === 'WHT') return <Wheat className="w-5 h-5 text-amber-600" /> // Âmbar mais escuro (Dourado)
        if (commodity === 'CRN') return <Sprout className="w-5 h-5 text-yellow-500" /> // Amarelo vibrante do milho
        return <Tractor className="w-5 h-5 text-muted-foreground" />
    }

    return (
        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight transition-colors">Minhas Lavouras</h1>
                    <p className="text-muted-foreground mt-1 transition-colors">Gestão de talhões e estimativa de safra</p>
                </div>

                {/* Modal Principal (Criar/Editar) */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Talhão
                    </Button>

                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingId ? "Editar Lavoura" : "Cadastrar Lavoura"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingId
                                    ? "Atualize os dados e o status da sua lavoura."
                                    : "Insira os dados do novo talhão. Eles serão sincronizados com o seu painel."}
                            </DialogDescription>
                        </DialogHeader>

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

                            {/* Novo Campo de Status! (Muito importante para atualizar) */}
                            <div className="space-y-2">
                                <Label>Fase da Lavoura (Status)</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger className="focus:ring-emerald-500">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNED" className="focus:bg-emerald-500/10">Planejado (Pré-plantio)</SelectItem>
                                        <SelectItem value="PLANTED" className="focus:bg-emerald-500/10">Plantado (Em desenvolvimento)</SelectItem>
                                        <SelectItem value="HARVESTED" className="focus:bg-emerald-500/10">Colhido (Finalizado)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="mt-6 pt-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingId ? 'Salvar Alterações' : 'Salvar Lavoura'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Modal de Confirmação de Exclusão (Alert Dialog) */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o talhão do seu banco de dados e removerá todas as projeções associadas a ele.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Sim, excluir talhão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Controle de Tela */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64 text-muted-foreground font-medium animate-pulse">Sincronizando...</div>
            ) : talhoes.length === 0 ? (
                <Card className="shadow-sm">
                    <CardContent className="p-12 flex flex-col items-center justify-center text-center">
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

                                {/* Título do Card com o Ícone e o MENU DE 3 PONTOS */}
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

                                    {/* Agrupamento do Ícone da Cultura + Menu de Opções */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border group-hover:bg-emerald-500/10 transition-colors">
                                            {getCommodityIcon(talhao.commodity)}
                                        </div>

                                        {/* O Menu Mágico! */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(talhao)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Editar</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400" onClick={() => handleOpenDelete(talhao.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Excluir</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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