export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  min_stock: number
  cost_per_unit: number
  supplier: string | null
  image_url: string | null
  last_restocked: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  item_id: string | null
  action: string
  quantity: number | null
  description: string
  created_at: string
}

export interface WasteTracking {
  id: string
  item_id: string | null
  quantity: number
  reason: string
  cost: number
  date: string
  created_at: string
}

export interface RestaurantProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  email_verified: boolean
  phone: string | null
  two_factor_enabled: boolean
}

export interface StockMovement {
  id: string
  item_id: string | null
  type: "entrada" | "saida" | "ajuste" | "desperdicio"
  quantity: number
  previous_quantity: number
  new_quantity: number
  reason: string | null
  cost: number
  created_at: string
  item_name?: string
}

export interface Notification {
  id: string
  type: "low_stock" | "critical_stock" | "waste" | "restock" | "info"
  title: string
  message: string
  item_id: string | null
  read: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  pdf_report_day: number
  high_contrast_mode: boolean
  guided_mode: boolean
  two_factor_enabled: boolean
  two_factor_method: string | null
  created_at: string
  updated_at: string
}

export interface ReportData {
  period: string
  generated_at: string
  restaurant: RestaurantProfile
  inventory_summary: {
    total_items: number
    total_value: number
    low_stock_items: number
    critical_stock_items: number
  }
  waste_summary: {
    total_waste: number
    total_cost: number
    by_category: { category: string; quantity: number; cost: number }[]
  }
  stock_movements: {
    total_entries: number
    total_exits: number
    total_waste: number
  }
  top_items: {
    most_used: InventoryItem[]
    most_wasted: { item: InventoryItem; waste: number }[]
  }
}
