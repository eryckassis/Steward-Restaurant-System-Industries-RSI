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
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { useSettings } from "@/lib/hooks/use-settings";

interface ChartData {
  month: string;
  value: number;
  date: string;
}

export function WasteChart() {
  const { settings } = useSettings();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const safeThreshold = settings?.waste_critical_threshold || 100;
  const criticalThreshold = settings?.waste_critical_threshold || 300;

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
          { month: "Jan", value: 0, date: "" },
          { month: "Fev", value: 0, date: "" },
          { month: "Mar", value: 0, date: "" },
          { month: "Abr", value: 0, date: "" },
          { month: "Mai", value: 0, date: "" },
          { month: "Jun", value: 0, date: "" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBarColor = (value: number) => {
    if (value <= safeThreshold) {
      return "hsl(142, 71%, 45%)"; // Verde - Safe zone
    } else if (value < criticalThreshold) {
      return "hsl(48, 96%, 53%)"; // Amarelow - Warning zone
    } else {
      return "hsl(0, 84.2%, 60.2%)"; // Vermelho  - Critical zone
    }
  };

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
      const value = payload[0].value;
      let zone = "Zona Segura";
      let zoneColor = "hsl(142, 71%, 45%)";

      if (value > safeThreshold && value < criticalThreshold) {
        zone = "Zona de Alerta";
        zoneColor = "hsl(48, 96%, 53%)";
      } else if (value >= criticalThreshold) {
        zone = "Zona Crítica";
        zoneColor = "hsl(0, 84.2%, 60.2%)";
      }
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: zoneColor }}
              />
              <span className="text-muted-foreground">Desperdício:</span>
              <span className="font-medium">R$ {value.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium" style={{ color: zoneColor }}>
                {zone}
              </span>
            </div>
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
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 mb-4">
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

          <div className="pt-3 border-t border-border">
            <p className="text-xs font-medium mb-2">Zonas de Tolerância</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[hsl(142,71%,45%)]" />
                <span className="text-muted-foreground">
                  Segura: R$ {safeThreshold.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-[hsl(48,96%,53%)]" />
                <span className="text-muted-foreground">
                  Alerta: R$ {safeThreshold.toFixed(2)} -{" "}
                  {criticalThreshold.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">
                  Crítica: R$ {criticalThreshold.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
