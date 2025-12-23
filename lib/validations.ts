// Validation schemas and utilities for inventory management

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const INVENTORY_CATEGORIES = [
  { value: "carnes", label: "Carnes" },
  { value: "laticinios", label: "Laticínios" },
  { value: "vegetais", label: "Vegetais" },
  { value: "frutas", label: "Frutas" },
  { value: "graos", label: "Grãos e Cereais" },
  { value: "bebidas", label: "Bebidas" },
  { value: "temperos", label: "Temperos e Condimentos" },
  { value: "congelados", label: "Congelados" },
  { value: "padaria", label: "Padaria" },
  { value: "limpeza", label: "Limpeza" },
  { value: "descartaveis", label: "Descartáveis" },
  { value: "outros", label: "Outros" },
] as const

export const INVENTORY_UNITS = [
  { value: "kg", label: "Quilograma (kg)", category: "peso" },
  { value: "g", label: "Grama (g)", category: "peso" },
  { value: "L", label: "Litro (L)", category: "volume" },
  { value: "ml", label: "Mililitro (ml)", category: "volume" },
  { value: "unid", label: "Unidade", category: "quantidade" },
  { value: "cx", label: "Caixa", category: "quantidade" },
  { value: "pct", label: "Pacote", category: "quantidade" },
  { value: "dz", label: "Dúzia", category: "quantidade" },
] as const

export const UNIT_CONVERSIONS: Record<string, { base: string; factor: number }> = {
  kg: { base: "kg", factor: 1 },
  g: { base: "kg", factor: 0.001 },
  L: { base: "L", factor: 1 },
  ml: { base: "L", factor: 0.001 },
}

export const VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  QUANTITY_MIN: 0,
  QUANTITY_MAX: 999999.99,
  COST_MIN: 0.01,
  COST_MAX: 999999.99,
  MIN_STOCK_MIN: 0,
  MIN_STOCK_MAX: 999999.99,
  SUPPLIER_MAX_LENGTH: 200,
  REASON_MAX_LENGTH: 500,
}

export function validateItemName(name: string): ValidationError | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return { field: "name", message: "Nome do item é obrigatório" }
  }

  if (trimmed.length < VALIDATION_LIMITS.NAME_MIN_LENGTH) {
    return { field: "name", message: `Nome deve ter pelo menos ${VALIDATION_LIMITS.NAME_MIN_LENGTH} caracteres` }
  }

  if (trimmed.length > VALIDATION_LIMITS.NAME_MAX_LENGTH) {
    return { field: "name", message: `Nome deve ter no máximo ${VALIDATION_LIMITS.NAME_MAX_LENGTH} caracteres` }
  }

  // Check for invalid characters
  if (!/^[a-zA-ZÀ-ÿ0-9\s\-_.(),&]+$/.test(trimmed)) {
    return { field: "name", message: "Nome contém caracteres inválidos" }
  }

  return null
}

export function validateCategory(category: string): ValidationError | null {
  if (!category || !category.trim()) {
    return { field: "category", message: "Categoria é obrigatória" }
  }

  return null
}

export function validateQuantity(
  quantity: string | number,
  options?: { allowZero?: boolean; max?: number },
): ValidationError | null {
  const numValue = typeof quantity === "string" ? Number.parseFloat(quantity) : quantity
  const { allowZero = false, max = VALIDATION_LIMITS.QUANTITY_MAX } = options || {}

  if (isNaN(numValue)) {
    return { field: "quantity", message: "Quantidade deve ser um número válido" }
  }

  if (!allowZero && numValue <= 0) {
    return { field: "quantity", message: "Quantidade deve ser maior que zero" }
  }

  if (allowZero && numValue < 0) {
    return { field: "quantity", message: "Quantidade não pode ser negativa" }
  }

  if (numValue > max) {
    return { field: "quantity", message: `Quantidade máxima permitida: ${max.toLocaleString("pt-BR")}` }
  }

  // Check decimal places (max 2)
  const decimalStr = quantity.toString()
  if (decimalStr.includes(".") && decimalStr.split(".")[1].length > 2) {
    return { field: "quantity", message: "Quantidade pode ter no máximo 2 casas decimais" }
  }

  return null
}

export function validateCostPerUnit(cost: string | number): ValidationError | null {
  const numValue = typeof cost === "string" ? Number.parseFloat(cost) : cost

  if (isNaN(numValue)) {
    return { field: "cost_per_unit", message: "Custo unitário deve ser um número válido" }
  }

  if (numValue < VALIDATION_LIMITS.COST_MIN) {
    return { field: "cost_per_unit", message: `Custo mínimo: R$ ${VALIDATION_LIMITS.COST_MIN.toFixed(2)}` }
  }

  if (numValue > VALIDATION_LIMITS.COST_MAX) {
    return { field: "cost_per_unit", message: `Custo máximo: R$ ${VALIDATION_LIMITS.COST_MAX.toLocaleString("pt-BR")}` }
  }

  // Check decimal places (max 2)
  const decimalStr = cost.toString()
  if (decimalStr.includes(".") && decimalStr.split(".")[1].length > 2) {
    return { field: "cost_per_unit", message: "Custo pode ter no máximo 2 casas decimais" }
  }

  return null
}

export function validateUnit(unit: string): ValidationError | null {
  if (!unit || !unit.trim()) {
    return { field: "unit", message: "Unidade é obrigatória" }
  }

  const validUnits = INVENTORY_UNITS.map((u) => u.value)
  if (!validUnits.includes(unit as any)) {
    return { field: "unit", message: "Unidade inválida. Selecione uma das opções disponíveis" }
  }

  return null
}

export function validateMinStock(minStock: string | number, unit: string): ValidationError | null {
  const numValue = typeof minStock === "string" ? Number.parseFloat(minStock) : minStock

  if (isNaN(numValue)) {
    return { field: "min_stock", message: "Estoque mínimo deve ser um número válido" }
  }

  if (numValue < VALIDATION_LIMITS.MIN_STOCK_MIN) {
    return { field: "min_stock", message: "Estoque mínimo não pode ser negativo" }
  }

  if (numValue > VALIDATION_LIMITS.MIN_STOCK_MAX) {
    return {
      field: "min_stock",
      message: `Estoque mínimo máximo: ${VALIDATION_LIMITS.MIN_STOCK_MAX.toLocaleString("pt-BR")}`,
    }
  }

  // Warn if min_stock seems too high for the unit
  const unitConfig = INVENTORY_UNITS.find((u) => u.value === unit)
  if (unitConfig?.category === "peso" && unit === "kg" && numValue > 10000) {
    return { field: "min_stock", message: "Estoque mínimo parece muito alto para kg. Verifique o valor" }
  }

  return null
}

export function validateSupplier(supplier: string | null | undefined): ValidationError | null {
  if (!supplier) return null

  if (supplier.length > VALIDATION_LIMITS.SUPPLIER_MAX_LENGTH) {
    return {
      field: "supplier",
      message: `Nome do fornecedor deve ter no máximo ${VALIDATION_LIMITS.SUPPLIER_MAX_LENGTH} caracteres`,
    }
  }

  return null
}

export function validateStockMovement(
  type: string,
  quantity: string | number,
  currentStock: number,
  reason?: string,
): ValidationResult {
  const errors: ValidationError[] = []
  const numQuantity = typeof quantity === "string" ? Number.parseFloat(quantity) : quantity

  // Validate type
  if (!["entrada", "saida", "desperdicio"].includes(type)) {
    errors.push({ field: "type", message: "Tipo de movimentação inválido" })
  }

  // Validate quantity
  const quantityError = validateQuantity(quantity)
  if (quantityError) {
    errors.push(quantityError)
  }

  // Validate stock availability for outgoing movements
  if ((type === "saida" || type === "desperdicio") && numQuantity > currentStock) {
    errors.push({
      field: "quantity",
      message: `Quantidade insuficiente. Estoque disponível: ${currentStock.toFixed(2)}`,
    })
  }

  // Validate reason for waste
  if (type === "desperdicio") {
    if (!reason || !reason.trim()) {
      errors.push({ field: "reason", message: "Motivo é obrigatório para registro de desperdício" })
    } else if (reason.length < 5) {
      errors.push({ field: "reason", message: "Descreva o motivo com mais detalhes (mínimo 5 caracteres)" })
    } else if (reason.length > VALIDATION_LIMITS.REASON_MAX_LENGTH) {
      errors.push({
        field: "reason",
        message: `Motivo deve ter no máximo ${VALIDATION_LIMITS.REASON_MAX_LENGTH} caracteres`,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateInventoryItem(item: {
  name: string
  category: string
  quantity: string | number
  unit: string
  min_stock: string | number
  cost_per_unit: string | number
  supplier?: string | null
}): ValidationResult {
  const errors: ValidationError[] = []

  const nameError = validateItemName(item.name)
  if (nameError) errors.push(nameError)

  const categoryError = validateCategory(item.category)
  if (categoryError) errors.push(categoryError)

  const quantityError = validateQuantity(item.quantity, { allowZero: true })
  if (quantityError) errors.push(quantityError)

  const unitError = validateUnit(item.unit)
  if (unitError) errors.push(unitError)

  const minStockError = validateMinStock(item.min_stock, item.unit)
  if (minStockError) errors.push(minStockError)

  const costError = validateCostPerUnit(item.cost_per_unit)
  if (costError) errors.push(costError)

  const supplierError = validateSupplier(item.supplier)
  if (supplierError) errors.push(supplierError)

  // Cross-field validations
  const qty = typeof item.quantity === "string" ? Number.parseFloat(item.quantity) : item.quantity
  const minQty = typeof item.min_stock === "string" ? Number.parseFloat(item.min_stock) : item.min_stock

  if (!isNaN(qty) && !isNaN(minQty) && qty < minQty) {
    errors.push({
      field: "quantity",
      message: "Quantidade inicial está abaixo do estoque mínimo. Considere ajustar os valores",
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatQuantityWithUnit(quantity: number, unit: string): string {
  const formatted = quantity.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${formatted} ${unit}`
}

export function calculateStockStatus(
  quantity: number,
  minStock: number,
): {
  status: "critical" | "low" | "medium" | "good"
  label: string
  percentage: number
} {
  if (minStock === 0) {
    return { status: "good", label: "OK", percentage: 100 }
  }

  const ratio = quantity / minStock
  const percentage = Math.min(ratio * 100, 100)

  if (ratio <= 0.3) {
    return { status: "critical", label: "Crítico", percentage }
  }
  if (ratio <= 0.6) {
    return { status: "low", label: "Baixo", percentage }
  }
  if (ratio <= 1) {
    return { status: "medium", label: "Médio", percentage }
  }
  return { status: "good", label: "OK", percentage: 100 }
}
