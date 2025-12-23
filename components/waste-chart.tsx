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
  Bar,
  BarChart,
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

export function WasteChart() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/charts/waste");
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const chartData = await response.json();
        setData(chartData);
      } catch (err) {
        console.error("Error fetching waste chart:", err);
        setError("Erro ao carregar dados");
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
          <CardTitle>Desperdício Mensal</CardTitle>
          <CardDescription>
            Valor estimado de produtos descartados (R$)
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
        <CardTitle>Desperdício Mensal</CardTitle>
        <CardDescription>
          {error ? error : "Valor estimado de produtos descartados (R$)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "rgba(255,255,255,0.2)" : "#e5e5e5"}
            />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: isDark ? "#fff" : "#000" }}
              stroke={isDark ? "#fff" : "#000"}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: isDark ? "#fff" : "#000" }}
              stroke={isDark ? "#fff" : "#000"}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: isDark ? "#fff" : "#000" }}
              itemStyle={{ color: isDark ? "#fff" : "#000" }}
              cursor={{
                fill: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [`R$ ${value}`, "Desperdício"]}
            />
            <Bar
              dataKey="value"
              fill={isDark ? "#ef4444" : "#ef4444"}
              radius={[4, 4, 0, 0]}
              activeBar={{ fill: isDark ? "#dc2626" : "#333" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
