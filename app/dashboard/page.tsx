import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { InventoryChart } from "@/components/inventory-chart"
import { WasteChart } from "@/components/waste-chart"
import { LowStockAlerts } from "@/components/low-stock-alerts"
import { RecentActivity } from "@/components/recent-activity"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu inventário e operações</p>
        </div>

        <DashboardStats />

        <div className="grid gap-6 lg:grid-cols-2">
          <InventoryChart />
          <WasteChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <LowStockAlerts />
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}
