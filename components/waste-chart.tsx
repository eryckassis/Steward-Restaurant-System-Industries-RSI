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
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--destructive))]" />
            <span className="text-muted-foreground">Desperdício:</span>
            <span className="font-medium">
              R$ {payload[0].value.toFixed(2)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalWaste = data.reduce((sum, item) => sum + item.value, 0);
  const averageWaste = data.length > 0 ? totalWaste / data.length : 0;
  const maxWaste = Math.max(...data.map((d) => d.value));

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
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--destructive))] mt-1" />
              <div className="text-xs">
                <p className="font-medium">Total do Período</p>
                <p className="text-muted-foreground">
                  R$ {totalWaste.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--destructive))] mt-1 opacity-70" />
              <div className="text-xs">
                <p className="font-medium">Média Mensal</p>
                <p className="text-muted-foreground">
                  R$ {averageWaste.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--destructive))] mt-1 opacity-50" />
              <div className="text-xs">
                <p className="font-medium">Pico de Desperdício</p>
                <p className="text-muted-foreground">
                  R$ {maxWaste.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
