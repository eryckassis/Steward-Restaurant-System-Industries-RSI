"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageCropUpload } from "@/components/image-crop-upload"
import { useState, useEffect } from "react"
import type { InventoryItem } from "@/lib/types"
import {
  validateInventoryItem,
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  formatCurrency,
  type ValidationError,
} from "@/lib/validations"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ItemDialogProps {
  item?: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ItemDialog({ item, open, onOpenChange, onSuccess }: ItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    min_stock: "",
    cost_per_unit: "",
    supplier: "",
    image_url: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        unit: item.unit,
        min_stock: item.min_stock.toString(),
        cost_per_unit: item.cost_per_unit.toString(),
        supplier: item.supplier || "",
        image_url: item.image_url || "",
      })
    } else {
      setFormData({
        name: "",
        category: "",
        quantity: "",
        unit: "",
        min_stock: "",
        cost_per_unit: "",
        supplier: "",
        image_url: "",
      })
    }
    setErrors([])
    setTouched({})
  }, [item, open])

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field when user starts typing
    if (touched[field]) {
      const validation = validateInventoryItem({ ...formData, [field]: value })
      setErrors(validation.errors)
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const validation = validateInventoryItem(formData)
    setErrors(validation.errors)
  }

  const getFieldError = (field: string): string | undefined => {
    if (!touched[field]) return undefined
    return errors.find((e) => e.field === field)?.message
  }

  const hasFieldError = (field: string): boolean => {
    return touched[field] && errors.some((e) => e.field === field)
  }

  const handleImageUpload = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", blob, "item-image.jpg")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setFormData((prev) => ({ ...prev, image_url: data.url }))
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => {
        acc[key] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
    setTouched(allTouched)

    // Validate all fields
    const validation = validateInventoryItem(formData)
    setErrors(validation.errors)

    if (!validation.isValid) {
      toast({
        title: "Erro de Validação",
        description: validation.errors[0]?.message || "Verifique os campos destacados",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const url = item ? `/api/inventory/${item.id}` : "/api/inventory"
      const method = item ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          quantity: Number.parseFloat(formData.quantity),
          unit: formData.unit,
          min_stock: Number.parseFloat(formData.min_stock),
          cost_per_unit: Number.parseFloat(formData.cost_per_unit),
          supplier: formData.supplier.trim() || null,
          image_url: formData.image_url || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao salvar item")
      }

      toast({
        title: "Sucesso",
        description: item ? "Item atualizado com sucesso" : "Item adicionado com sucesso",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar item",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totalCost = (() => {
    const qty = Number.parseFloat(formData.quantity)
    const cost = Number.parseFloat(formData.cost_per_unit)
    if (isNaN(qty) || isNaN(cost)) return null
    return qty * cost
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Item" : "Adicionar Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Atualize as informações do item" : "Adicione um novo item ao inventário"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Imagem do Item</Label>
            <ImageCropUpload
              currentImage={formData.image_url || undefined}
              onImageCropped={handleImageUpload}
              title="Imagem do Item"
              description="Adicione uma foto do item para facilitar a identificação"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Nome *
                {touched.name && !hasFieldError("name") && formData.name && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={hasFieldError("name") ? "border-destructive" : ""}
                placeholder="Ex: Filé Mignon"
              />
              {getFieldError("name") && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("name")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-1">
                Categoria *
                {touched.category && !hasFieldError("category") && formData.category && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  handleFieldChange("category", value)
                  setTouched((prev) => ({ ...prev, category: true }))
                }}
              >
                <SelectTrigger className={hasFieldError("category") ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("category") && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("category")}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-1">
                Quantidade *
                {touched.quantity && !hasFieldError("quantity") && formData.quantity && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleFieldChange("quantity", e.target.value)}
                onBlur={() => handleBlur("quantity")}
                className={hasFieldError("quantity") ? "border-destructive" : ""}
                placeholder="0.00"
              />
              {getFieldError("quantity") && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("quantity")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="flex items-center gap-1">
                Unidade *
                {touched.unit && !hasFieldError("unit") && formData.unit && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => {
                  handleFieldChange("unit", value)
                  setTouched((prev) => ({ ...prev, unit: true }))
                }}
              >
                <SelectTrigger className={hasFieldError("unit") ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg" className="font-medium">
                    Peso
                  </SelectItem>
                  {INVENTORY_UNITS.filter((u) => u.category === "peso").map((unit) => (
                    <SelectItem key={unit.value} value={unit.value} className="pl-6">
                      {unit.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="L" className="font-medium" disabled>
                    Volume
                  </SelectItem>
                  {INVENTORY_UNITS.filter((u) => u.category === "volume").map((unit) => (
                    <SelectItem key={unit.value} value={unit.value} className="pl-6">
                      {unit.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="unid" className="font-medium" disabled>
                    Quantidade
                  </SelectItem>
                  {INVENTORY_UNITS.filter((u) => u.category === "quantidade").map((unit) => (
                    <SelectItem key={unit.value} value={unit.value} className="pl-6">
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("unit") && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("unit")}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_stock" className="flex items-center gap-1">
                Estoque Mínimo *
                {touched.min_stock && !hasFieldError("min_stock") && formData.min_stock && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </Label>
              <Input
                id="min_stock"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_stock}
                onChange={(e) => handleFieldChange("min_stock", e.target.value)}
                onBlur={() => handleBlur("min_stock")}
                className={hasFieldError("min_stock") ? "border-destructive" : ""}
                placeholder="0.00"
              />
              {getFieldError("min_stock") ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("min_stock")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Alerta quando estoque atingir este valor</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_unit" className="flex items-center gap-1">
                Custo Unitário (R$) *
                {touched.cost_per_unit && !hasFieldError("cost_per_unit") && formData.cost_per_unit && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.cost_per_unit}
                  onChange={(e) => handleFieldChange("cost_per_unit", e.target.value)}
                  onBlur={() => handleBlur("cost_per_unit")}
                  className={`pl-9 ${hasFieldError("cost_per_unit") ? "border-destructive" : ""}`}
                  placeholder="0.00"
                />
              </div>
              {getFieldError("cost_per_unit") && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("cost_per_unit")}
                </p>
              )}
            </div>
          </div>

          {totalCost !== null && totalCost > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm">
                <span className="text-muted-foreground">Valor total em estoque: </span>
                <span className="font-semibold">{formatCurrency(totalCost)}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => handleFieldChange("supplier", e.target.value)}
              onBlur={() => handleBlur("supplier")}
              className={hasFieldError("supplier") ? "border-destructive" : ""}
              placeholder="Nome do fornecedor (opcional)"
            />
            {getFieldError("supplier") && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("supplier")}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : item ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
