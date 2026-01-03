"use client";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";

interface ChartData {
  month: string;
  total: number;
  entradas: number;
  saidas: number;
  desperdicio: number;
}

export function InventoryChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/charts/inventory");
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const chartData = await response.json();
        setData(chartData);
      } catch (err) {
        console.error("Error fetching inventory chart:", err);
        setError("Erro ao carregar dados");
        // Fallback data
        setData([
          { month: "Jan", total: 0, entradas: 0, saidas: 0, desperdicio: 0 },
          { month: "Fev", total: 0, entradas: 0, saidas: 0, desperdicio: 0 },
          { month: "Mar", total: 0, entradas: 0, saidas: 0, desperdicio: 0 },
          { month: "Abr", total: 0, entradas: 0, saidas: 0, desperdicio: 0 },
          { month: "Mai", total: 0, entradas: 0, saidas: 0, desperdicio: 0 },
          { month: "Jun", total: 0, entradas: 0, saidas: 0, desperdicio: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nível de Inventário</CardTitle>
          <CardDescription>
            Número total de itens nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-75 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Carregando...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nível de Inventário</CardTitle>
        <CardDescription>
          {error ? error : "Número total de itens nos últimos 6 meses"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "rgba(255, 255, 255, 0.2)" : "#e5e5e5"}
            />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: isDark ? "#fff" : "hsl(var(--muted-foreground))" }}
              stroke={isDark ? "#fff" : "hsl(var(--muted-foreground))"}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: isDark ? "#fff" : "hsl(var(--muted-foreground))" }}
              stroke={isDark ? "#fff" : "hsl(var(--muted-foreground))"}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              name="Total em estoque"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: isDark ? "#fff" : "#000" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: isDark ? "#fff" : "#000" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="saidas"
              name="Saídas"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: isDark ? "#fff" : "#000" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
