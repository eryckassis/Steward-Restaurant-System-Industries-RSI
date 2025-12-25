"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Activity } from "@/components/animate-ui/icons/activity";
import { MessageSquareWarning } from "@/components/animate-ui/icons/message-square-warning";
import { ClipboardList } from "@/components/animate-ui/icons/clipboard-list";

// Ícone SVG customizado
const StorefrontIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75s1.624-.28 2.25-.75c.626.47 1.406.75 2.25.75s1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.88 1.88 0 0 0-1.325-.549z" />
    <path
      fillRule="evenodd"
      d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.2 5.2 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.2 5.2 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506a5.26 5.26 0 0 0 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

const WasteIcon = ({ className }: { className?: string }) => (
  <Activity className={className} animateOnHover />
);

const AlertIcon = ({ className }: { className?: string }) => (
  <MessageSquareWarning className={className} animateOnHover />
);

const Clipboard = ({ className }: { className?: string }) => (
  <ClipboardList className={className} animateOnHover />
);
interface Stats {
  totalItems: number;
  lowStockCount: number;
  totalValue: string;
  wasteValue: string;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("[v0] Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Itens em Estoque",
      value: stats.totalItems.toString(),
      change: "Total de produtos",
      trend: "up",
      icon: StorefrontIcon,
    },
    {
      title: "Valor Total",
      value: `R$ ${stats.totalValue}`,
      change: "Inventário total",
      trend: "up",
      icon: Clipboard,
    },
    {
      title: "Desperdício (30d)",
      value: `R$ ${stats.wasteValue}`,
      change: "Últimos 30 dias",
      trend: "down",
      icon: WasteIcon,
    },
    {
      title: "Alertas Ativos",
      value: stats.lowStockCount.toString(),
      change: "Estoque baixo",
      trend: "warning",
      icon: AlertIcon,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
