"use client";

import type React from "react";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Chatbot({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat<UIMessage>({
    transport: new DefaultChatTransport({ api: "/api/chatbot/chat" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;

    sendMessage({ text: input });
    setInput("");
  };

  const handleDownloadMarkdown = (markdown: string) => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-4 bottom-4 top-20 w-full max-w-lg">
        <Card className="flex h-full flex-col shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Assistente IA</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Auxílio para gerenciamento de inventário
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 py-4">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    <p className="mb-4">
                      Olá! Sou seu assistente IA para inventário.
                    </p>
                    <p className="text-xs">Posso ajudar você a:</p>
                    <ul className="text-xs mt-2 space-y-1">
                      <li>📦 Buscar itens no inventário</li>
                      <li>📊 Gerar relatórios PDF e Markdown</li>
                      <li>🏪 Encontrar promoções em supermercados</li>
                      <li>💡 Fornecer insights sobre estoque</li>
                    </ul>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.parts.map((part, index) => {
                        if (isTextUIPart(part)) {
                          return (
                            <p
                              key={index}
                              className="text-sm whitespace-pre-wrap"
                            >
                              {part.text}
                            </p>
                          );
                        }

                        if (isToolUIPart(part)) {
                          const toolName =
                            part.type === "dynamic-tool"
                              ? part.toolName
                              : part.type.replace("tool-", "");

                          if (part.state === "output-available") {
                            const output = part.output as any;

                            // Handle markdown download
                            if (output.markdown) {
                              return (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm">{output.message}</p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDownloadMarkdown(output.markdown)
                                    }
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar Relatório .MD
                                  </Button>
                                </div>
                              );
                            }

                            // Handle supermarket results
                            if (output.results) {
                              return (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm font-medium">
                                    {output.message}
                                  </p>
                                  <div className="space-y-2">
                                    {output.results.map(
                                      (result: any, i: number) => (
                                        <div
                                          key={i}
                                          className="text-xs p-2 rounded border"
                                        >
                                          <div className="font-medium">
                                            {result.supermarket}
                                          </div>
                                          <div className="flex justify-between mt-1">
                                            <span className="text-green-600 dark:text-green-400 font-bold">
                                              R$ {result.price.toFixed(2)}
                                            </span>
                                            <span className="text-muted-foreground">
                                              {result.distance}
                                            </span>
                                          </div>
                                          <div className="text-orange-600 dark:text-orange-400 text-xs">
                                            {result.discount}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            // Handle inventory results
                            if (output.items) {
                              return (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm font-medium">
                                    {output.summary}
                                  </p>
                                  <div className="space-y-1">
                                    {output.items
                                      .slice(0, 5)
                                      .map((item: any) => (
                                        <div
                                          key={item.id}
                                          className="text-xs p-2 rounded border"
                                        >
                                          <div className="font-medium">
                                            {item.name}
                                          </div>
                                          <div className="text-muted-foreground">
                                            {item.quantity} {item.unit} •{" "}
                                            {item.category}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              );
                            }

                            // Handle stats
                            if (output.total_items !== undefined) {
                              return (
                                <div key={index} className="space-y-2 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 rounded bg-background">
                                      <div className="text-xs text-muted-foreground">
                                        Total de Itens
                                      </div>
                                      <div className="font-bold">
                                        {output.total_items}
                                      </div>
                                    </div>
                                    <div className="p-2 rounded bg-background">
                                      <div className="text-xs text-muted-foreground">
                                        Valor Total
                                      </div>
                                      <div className="font-bold">
                                        R$ {output.total_value.toFixed(2)}
                                      </div>
                                    </div>
                                    <div className="p-2 rounded bg-background">
                                      <div className="text-xs text-muted-foreground">
                                        Estoque Baixo
                                      </div>
                                      <div className="font-bold text-orange-600">
                                        {output.low_stock_items}
                                      </div>
                                    </div>
                                    <div className="p-2 rounded bg-background">
                                      <div className="text-xs text-muted-foreground">
                                        Crítico
                                      </div>
                                      <div className="font-bold text-red-600">
                                        {output.critical_stock_items}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {output.recommendations}
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <p
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                {JSON.stringify(output)}
                              </p>
                            );
                          }

                          if (part.state === "input-available") {
                            return (
                              <p
                                key={index}
                                className="text-xs text-muted-foreground"
                              >
                                Processando {toolName}...
                              </p>
                            );
                          }
                        }

                        return null;
                      })}
                    </div>

                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {status === "streaming" && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t pt-4">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={status !== "ready"}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={status !== "ready" || !input.trim()}
              >
                {status === "streaming" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
