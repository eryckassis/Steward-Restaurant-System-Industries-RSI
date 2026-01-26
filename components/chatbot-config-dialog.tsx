"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ChatbotConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LLM_PROVIDERS = [
  { value: "openai", label: "OpenAI (via AI Gateway)" },
  { value: "anthropic", label: "Anthropic (via AI Gateway)" },
  { value: "xai", label: "xAI Grok (via AI Gateway)" },
  { value: "google", label: "Google (via AI Gateway)" },
];

const LLM_MODELS = {
  openai: ["gpt-5", "gpt-5-mini"],
  anthropic: ["claude-sonnet-4.5", "claude-opus-4"],
  xai: ["grok-4", "grok-4-fast"],
  google: ["gemini-3-pro", "gemini-3-flash"],
};

const AVAILABLE_TOOLS = [
  { id: "inventory_search", label: "Busca no Inventário" },
  { id: "get_stats", label: "Estatísticas do Inventário" },
  { id: "generate_pdf", label: "Gerar Relatório PDF" },
  { id: "generate_markdown", label: "Gerar Relatório Markdown" },
  { id: "supermarket_search", label: "Buscar Promoções em Supermercados" },
];

export function ChatbotConfigDialog({
  open,
  onOpenChange,
}: ChatbotConfigDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [config, setConfig] = useState({
    llm_provider: "openai",
    llm_model: "gpt-5",
    api_key: "",
    search_region: "São Paulo, SP",
    enabled_tools: [
      "inventory_search",
      "get_stats",
      "generate_pdf",
      "generate_markdown",
      "supermarket_search",
    ],
  });

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chatbot/config");
      if (response.ok) {
        const data = await response.json();
        setConfig({
          llm_provider: data.llm_provider || "openai",
          llm_model: data.llm_model || "gpt-5",
          api_key: data.api_key || "",
          search_region: data.search_region || "São Paulo, SP",
          enabled_tools: data.enabled_tools || [
            "inventory_search",
            "get_stats",
            "generate_pdf",
            "generate_markdown",
            "supermarket_search",
          ],
        });
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/chatbot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: "Configurações salvas",
          description:
            "As configurações do chatbot foram atualizadas com sucesso.",
        });
        onOpenChange(false);
      } else {
        throw new Error("Failed to save config");
      }
    } catch {
      toast({
        title: "Erro ao salvar",
        description:
          "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setConfig((prev) => ({
      ...prev,
      enabled_tools: prev.enabled_tools.includes(toolId)
        ? prev.enabled_tools.filter((id) => id !== toolId)
        : [...prev.enabled_tools, toolId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Configurações do Assistente IA</DialogTitle>
          <DialogDescription>
            Configure o modelo de linguagem, região de busca e funcionalidades
            do chatbot.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provedor LLM</Label>
              <Select
                value={config.llm_provider}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    llm_provider: value,
                    llm_model: LLM_MODELS[value as keyof typeof LLM_MODELS][0],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LLM_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Todos os provedores usam o AI Gateway da Vercel por padrão, sem
                necessidade de configuração adicional.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select
                value={config.llm_model}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, llm_model: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LLM_MODELS[
                    config.llm_provider as keyof typeof LLM_MODELS
                  ].map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>API Key (opcional)</Label>
              <Input
                type="password"
                placeholder="Deixe vazio para usar AI Gateway"
                value={config.api_key}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, api_key: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Somente necessário se você quiser usar sua própria chave de API
                ao invés do AI Gateway.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Região de Busca de Supermercados</Label>
              <Input
                placeholder="Ex: São Paulo, SP ou Rio de Janeiro, RJ"
                value={config.search_region}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    search_region: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Esta região será usada quando você pedir para buscar promoções
                em supermercados.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ferramentas Habilitadas</Label>
              <div className="space-y-2">
                {AVAILABLE_TOOLS.map((tool) => (
                  <div key={tool.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tool.id}
                      checked={config.enabled_tools.includes(tool.id)}
                      onCheckedChange={() => toggleTool(tool.id)}
                    />
                    <Label
                      htmlFor={tool.id}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {tool.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Desabilite ferramentas que você não deseja que o assistente use.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
