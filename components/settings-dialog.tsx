"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Download, GraduationCap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { PDFReport } from "@/components/pdf-report";
import type { UserSettings, ReportData } from "@/lib/types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTour: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  onStartTour,
}: SettingsDialogProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [safeThreshold, setSafeThreshold] = useState<string>("100");
  const [criticalThreshold, setCriticalThreshold] = useState<string>("300");
  const [thresholdError, setThresholdError] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  useEffect(() => {
    if (settings) {
      setSafeThreshold(String(settings.waste_safe_threshold || 100));
      setCriticalThreshold(String(settings.waste_critical_threshold || 300));
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update settings");
      }

      const updated = await response.json();
      setSettings(updated);
      toast.success("Configurações atualizadas!");

      if (updates.high_contrast_mode !== undefined) {
        document.documentElement.classList.toggle(
          "high-contrast",
          updates.high_contrast_mode
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdUpdate = () => {
    const safe = Number.parseFloat(safeThreshold);
    const critical = Number.parseFloat(criticalThreshold);

    if (isNaN(safe) || isNaN(critical)) {
      setThresholdError("Por favor, insira valores numéricos válidos");
      return;
    }

    if (safe < 0 || critical < 0) {
      setThresholdError("Os valores devem ser positivos");
      return;
    }

    if (safe >= critical) {
      setThresholdError("O limite seguro deve ser menor que o limite crítico");
      return;
    }

    setThresholdError("");
    updateSettings({
      waste_safe_threshold: safe,
      waste_critical_threshold: critical,
    });
  };

  const generateAndDownloadPDF = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/reports/generate");
      if (!response.ok) throw new Error("Failed to generate report");

      const reportData: ReportData = await response.json();

      const blob = await pdf(<PDFReport data={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Relatório PDF baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório PDF");
    } finally {
      setGenerating(false);
    }
  };

  const getNextReportDate = () => {
    if (!settings) return new Date();
    const today = new Date();
    const nextDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      settings.pdf_report_day
    );
    if (nextDate <= today) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  };

  if (!settings) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Configurações do Sistema</DialogTitle>
          <DialogDescription>
            Personalize sua experiência no RestaurantOS
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="waste">Desperdício</TabsTrigger>
            <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
            <TabsTrigger value="help">Ajuda</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-day">Dia do Mês para Relatório</Label>
                <Select
                  value={String(settings.pdf_report_day)}
                  onValueChange={(value) =>
                    updateSettings({ pdf_report_day: Number.parseInt(value) })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Define qual dia do mês o relatório ficará disponível para
                  download
                </p>
              </div>

              <div className="space-y-2">
                <Label>Próximo Relatório Disponível</Label>
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {getNextReportDate().toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              <Button
                onClick={generateAndDownloadPDF}
                disabled={generating}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {generating ? "Gerando PDF..." : "Baixar Relatório PDF"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="waste" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">
                    Zonas de Tolerância de Desperdício
                  </p>
                  <p>
                    Configure os limites para classificar o desperdício mensal
                    em zonas: Segura (verde), Alerta (amarelo) e Crítica
                    (vermelho).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="safe-threshold">Limite Seguro (R$)</Label>
                <Input
                  id="safe-threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={safeThreshold}
                  onChange={(e) => {
                    setSafeThreshold(e.target.value);
                    setThresholdError("");
                  }}
                  placeholder="100.00"
                />
                <p className="text-xs text-muted-foreground">
                  Desperdício até este valor será considerado seguro (zona
                  verde)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="critical-threshold">Limite Crítico (R$)</Label>
                <Input
                  id="critical-threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={criticalThreshold}
                  onChange={(e) => {
                    setCriticalThreshold(e.target.value);
                    setThresholdError("");
                  }}
                  placeholder="300.00"
                />
                <p className="text-xs text-muted-foreground">
                  Desperdício acima deste valor será considerado crítico (zona
                  vermelha)
                </p>
              </div>

              {thresholdError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{thresholdError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium mb-2">
                  Pré-visualização das Zonas
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded bg-[hsl(142,71%,45%)]" />
                    <span className="text-muted-foreground">
                      Zona Segura: R$ 0.00 - R${" "}
                      {Number.parseFloat(safeThreshold || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded bg-[hsl(48,96%,53%)]" />
                    <span className="text-muted-foreground">
                      Zona de Alerta: R${" "}
                      {Number.parseFloat(safeThreshold || "0").toFixed(2)} - R${" "}
                      {Number.parseFloat(criticalThreshold || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded bg-[hsl(var(--destructive))]" />
                    <span className="text-muted-foreground">
                      Zona Crítica: ≥ R${" "}
                      {Number.parseFloat(criticalThreshold || "0").toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleThresholdUpdate}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Salvando..." : "Salvar Limites"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">Modo Alto Contraste</Label>
                <p className="text-sm text-muted-foreground">
                  Aumenta o contraste para melhor legibilidade
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.high_contrast_mode}
                onCheckedChange={(checked) =>
                  updateSettings({ high_contrast_mode: checked })
                }
                disabled={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label>Tour Guiado para Iniciantes</Label>
                  <p className="text-sm text-muted-foreground">
                    Aprenda a usar o sistema passo a passo
                  </p>
                </div>
                <Button
                  onClick={() => {
                    onStartTour();
                    onOpenChange(false);
                  }}
                  variant="outline"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Iniciar Tour
                </Button>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="guided-mode">Mostrar Tour ao Entrar</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir o tour automaticamente para novos usuários
                  </p>
                </div>
                <Switch
                  id="guided-mode"
                  checked={settings.guided_mode}
                  onCheckedChange={(checked) =>
                    updateSettings({ guided_mode: checked })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
