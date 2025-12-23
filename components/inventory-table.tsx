"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Pencil, Trash2, AlertCircle, RefreshCw, ArrowUpDown, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState, useCallback } from "react"
import type { InventoryItem } from "@/lib/types"
import { ItemDialog } from "./item-dialog"
import { StockMovementDialog } from "./stock-movement-dialog"
import { useToast } from "@/hooks/use-toast"

interface InventoryTableProps {
  searchQuery?: string
  categoryFilter?: string
  statusFilter?: string
}

export function InventoryTable({
  searchQuery = "",
  categoryFilter = "all",
  statusFilter = "all",
}: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [movementItem, setMovementItem] = useState<InventoryItem | null>(null)
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/inventory?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error("Dados inválidos recebidos do servidor")
      }

      setItems(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar inventário"
      console.error("Error fetching items:", err)
      setError(errorMessage)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryFilter, statusFilter])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este item?")) return

    setDeletingId(id)

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao remover item")
      }

      toast({
        title: "Sucesso",
        description: "Item removido com sucesso",
      })

      await fetchItems()
    } catch (err) {
      console.error("Error deleting item:", err)
      toast({
        title: "Erro",
        description: "Não foi possível remover o item",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    fetchItems()
  }

  const handleMovement = (item: InventoryItem) => {
    setMovementItem(item)
    setIsMovementDialogOpen(true)
  }

  const handleMovementClose = () => {
    setIsMovementDialogOpen(false)
    setMovementItem(null)
    fetchItems()
  }

  const getStatus = (item: InventoryItem) => {
    const ratio = item.quantity / item.min_stock
    if (ratio <= 0.3) return "critical"
    if (ratio <= 0.6) return "low"
    if (ratio <= 1) return "medium"
    return "good"
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="font-semibold text-lg">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button onClick={fetchItems} variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Custo Unitário</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                    ? "Nenhum item encontrado com os filtros aplicados"
                    : "Nenhum item no inventário. Clique em 'Adicionar Item' para começar."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const status = getStatus(item)
                const isDeleting = deletingId === item.id

                return (
                  <TableRow key={item.id} className={isDeleting ? "opacity-50" : ""}>
                    <TableCell>
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={item.image_url || undefined} className="object-cover" />
                        <AvatarFallback className="rounded-md">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>R$ {item.cost_per_unit.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "critical"
                            ? "destructive"
                            : status === "low"
                              ? "default"
                              : status === "medium"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {status === "critical"
                          ? "Crítico"
                          : status === "low"
                            ? "Baixo"
                            : status === "medium"
                              ? "Médio"
                              : "OK"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isDeleting}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleMovement(item)}>
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Movimentar Estoque
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? "Removendo..." : "Remover"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ItemDialog item={editingItem} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={handleDialogClose} />

      <StockMovementDialog
        item={movementItem}
        open={isMovementDialogOpen}
        onOpenChange={setIsMovementDialogOpen}
        onSuccess={handleMovementClose}
      />
    </>
  )
}
