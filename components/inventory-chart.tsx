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
  value: number;
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
          { month: "Jan", value: 0 },
          { month: "Fev", value: 0 },
          { month: "Mar", value: 0 },
          { month: "Abr", value: 0 },
          { month: "Mai", value: 0 },
          { month: "Jun", value: 0 },
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
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Carregando...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: isDark ? "#fff" : "#000" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
