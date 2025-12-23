"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import type { InventoryItem } from "@/lib/types"
import { validateStockMovement, formatCurrency, formatQuantityWithUnit, calculateStockStatus } from "@/lib/validations"
import { AlertCircle, TrendingUp, TrendingDown, Trash2, CheckCircle2 } from "lucide-react"

interface StockMovementDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function StockMovementDialog({ item, open, onOpenChange, onSuccess }: StockMovementDialogProps) {
  const [type, setType] = useState<string>("saida")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setType("saida")
      setQuantity("")
      setReason("")
      setTouched({})
    }
  }, [open])

  const getValidation = () => {
    if (!item) return { isValid: false, errors: [] }
    return validateStockMovement(type, quantity, item.quantity, reason)
  }

  const validation = getValidation()

  const getFieldError = (field: string): string | undefined => {
    if (!touched[field]) return undefined
    return validation.errors.find((e) => e.field === field)?.message
  }

  const getStockPreview = () => {
    if (!item || !quantity) return null
    const qty = Number.parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) return null

    let newQuantity: number
    if (type === "entrada") {
      newQuantity = item.quantity + qty
    } else {
      newQuantity = Math.max(0, item.quantity - qty)
    }

    const currentStatus = calculateStockStatus(item.quantity, item.min_stock)
    const newStatus = calculateStockStatus(newQuantity, item.min_stock)

    return {
      current: item.quantity,
      change: type === "entrada" ? qty : -qty,
      new: newQuantity,
      currentStatus,
      newStatus,
      cost: qty * item.cost_per_unit,
    }
  }

  const preview = getStockPreview()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ type: true, quantity: true, reason: true })

    if (!item || !validation.isValid) {
      toast({
        title: "Erro de Validação",
        description: validation.errors[0]?.message || "Verifique os campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          type,
          quantity: Number.parseFloat(quantity),
          reason: reason.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao registrar movimentação")
      }

      const actionLabels: Record<string, string> = {
        entrada: "Entrada registrada",
        saida: "Saída registrada",
        desperdicio: "Desperdício registrado",
      }

      toast({
        title: "Sucesso",
        description: actionLabels[type] || "Movimentação registrada",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar movimentação",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case "entrada":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "saida":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      case "desperdicio":
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  if (!item) return null

  const currentStatus = calculateStockStatus(item.quantity, item.min_stock)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon()}
            Movimentação de Estoque
          </DialogTitle>
          <DialogDescription>{item.name}</DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estoque Atual</span>
            <span className="font-semibold">{formatQuantityWithUnit(item.quantity, item.unit)}</span>
          </div>
          <Progress
            value={currentStatus.percentage}
            className={`h-2 ${
              currentStatus.status === "critical"
                ? "[&>div]:bg-red-500"
                : currentStatus.status === "low"
                  ? "[&>div]:bg-amber-500"
                  : currentStatus.status === "medium"
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-green-500"
            }`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Mínimo: {formatQuantityWithUnit(item.min_stock, item.unit)}</span>
            <span
              className={`font-medium ${
                currentStatus.status === "critical"
                  ? "text-red-500"
                  : currentStatus.status === "low"
                    ? "text-amber-500"
                    : currentStatus.status === "medium"
                      ? "text-yellow-600"
                      : "text-green-500"
              }`}
            >
              {currentStatus.label}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimentação *</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v)
                setTouched((prev) => ({ ...prev, type: true }))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Entrada (Reabastecimento)
                  </div>
                </SelectItem>
                <SelectItem value="saida">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                    Saída (Uso/Venda)
                  </div>
                </SelectItem>
                <SelectItem value="desperdicio">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                    Desperdício
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-1">
              Quantidade ({item.unit}) *
              {touched.quantity && !getFieldError("quantity") && quantity && Number.parseFloat(quantity) > 0 && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              max={type !== "entrada" ? item.quantity : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, quantity: true }))}
              className={getFieldError("quantity") ? "border-destructive" : ""}
              placeholder="0.00"
            />
            {getFieldError("quantity") ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("quantity")}
              </p>
            ) : (
              type !== "entrada" && (
                <p className="text-xs text-muted-foreground">
                  Máximo disponível: {formatQuantityWithUnit(item.quantity, item.unit)}
                </p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center gap-1">
              Motivo {type === "desperdicio" && "*"}
              {type === "desperdicio" && touched.reason && !getFieldError("reason") && reason.length >= 5 && (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              )}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, reason: true }))}
              className={getFieldError("reason") ? "border-destructive" : ""}
              placeholder={
                type === "entrada"
                  ? "Ex: Compra do fornecedor X, NF #12345"
                  : type === "saida"
                    ? "Ex: Preparo para serviço do dia"
                    : "Ex: Produto vencido em 20/01, embalagem danificada..."
              }
              rows={3}
            />
            {getFieldError("reason") ? (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("reason")}
              </p>
            ) : (
              type === "desperdicio" && (
                <p className="text-xs text-muted-foreground">Descreva o motivo do desperdício para controle interno</p>
              )
            )}
          </div>

          {preview && (
            <div
              className={`p-4 rounded-lg border ${
                type === "desperdicio"
                  ? "bg-destructive/10 border-destructive/20"
                  : type === "entrada"
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-blue-500/10 border-blue-500/20"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Estoque atual:</span>
                  <span>{formatQuantityWithUnit(preview.current, item.unit)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>{type === "entrada" ? "Adicionar:" : "Remover:"}</span>
                  <span className={type === "entrada" ? "text-green-600" : "text-red-600"}>
                    {type === "entrada" ? "+" : "-"}
                    {formatQuantityWithUnit(Math.abs(preview.change), item.unit)}
                  </span>
                </div>
                <hr className="border-dashed" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Novo estoque:</span>
                  <span
                    className={
                      preview.newStatus.status === "critical"
                        ? "text-red-500"
                        : preview.newStatus.status === "low"
                          ? "text-amber-500"
                          : ""
                    }
                  >
                    {formatQuantityWithUnit(preview.new, item.unit)}
                  </span>
                </div>
                {(type === "saida" || type === "desperdicio") && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span>{type === "desperdicio" ? "Custo do desperdício:" : "Valor da saída:"}</span>
                    <span className={type === "desperdicio" ? "text-destructive font-medium" : ""}>
                      {formatCurrency(preview.cost)}
                    </span>
                  </div>
                )}
                {preview.newStatus.status !== preview.currentStatus.status && (
                  <p
                    className={`text-xs mt-2 ${
                      preview.newStatus.status === "critical"
                        ? "text-red-500"
                        : preview.newStatus.status === "low"
                          ? "text-amber-500"
                          : "text-green-500"
                    }`}
                  >
                    Status mudará de "{preview.currentStatus.label}" para "{preview.newStatus.label}"
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (!validation.isValid && Object.keys(touched).length > 0)}
              variant={type === "desperdicio" ? "destructive" : "default"}
            >
              {loading ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
