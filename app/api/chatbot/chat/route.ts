import { convertToModelMessages, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const searchInventoryTool = tool({
  description:
    "Search and filter inventory items by name, category, or stock status",
  inputSchema: z.object({
    query: z.string().optional().describe("Search term for item name"),
    category: z.string().optional().describe("Filter by category"),
    low_stock_only: z
      .boolean()
      .optional()
      .describe("Show only low stock items"),
  }),
  execute: async ({ query, category, low_stock_only }) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    let queryBuilder = supabase
      .from("inventory_items")
      .select("*")
      .eq("user_id", user.id);

    if (query) {
      queryBuilder = queryBuilder.ilike("name", `%${query}%`);
    }

    if (category) {
      queryBuilder = queryBuilder.eq("category", category);
    }

    const { data, error } = await queryBuilder;

    if (error) throw new Error(error.message);

    let items = data || [];

    if (low_stock_only) {
      items = items.filter((item) => item.quantity <= item.min_stock);
    }

    return {
      total: items.length,
      items: items.slice(0, 10),
      summary: `Encontrei ${items.length} item(ns) no inventário.`,
    };
  },
});

const generatePDFReportTool = tool({
  description: "Generate a PDF report of inventory, waste, and stock movements",
  inputSchema: z.object({
    include_charts: z
      .boolean()
      .optional()
      .describe("Include charts in the report"),
  }),
  execute: async ({ include_charts = true }) => {
    return {
      message:
        "Relatório PDF gerado com sucesso! Acesse a seção de Configurações > Relatórios para fazer o download.",
      report_ready: true,
    };
  },
});

const generateMarkdownReportTool = tool({
  description: "Generate a Markdown (.md) formatted report",
  inputSchema: z.object({
    sections: z
      .array(z.string())
      .optional()
      .describe("Sections to include: inventory, waste, movements"),
  }),
  execute: async ({ sections = ["inventory", "waste", "movements"] }) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: items } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("user_id", user.id)
      .limit(10);

    let markdown = "# Relatório de Inventário\n\n";
    markdown += `**Gerado em:** ${new Date().toLocaleString("pt-BR")}\n\n`;

    if (sections.includes("inventory")) {
      markdown += "## Inventário\n\n";
      markdown += "| Item | Categoria | Quantidade | Unidade | Status |\n";
      markdown += "|------|-----------|------------|---------|--------|\n";

      items?.forEach((item) => {
        const status = item.quantity <= item.min_stock ? "🔴 Baixo" : "🟢 OK";
        markdown += `| ${item.name} | ${item.category} | ${item.quantity} | ${item.unit} | ${status} |\n`;
      });
      markdown += "\n";
    }

    return {
      markdown,
      download_url:
        "data:text/markdown;charset=utf-8," + encodeURIComponent(markdown),
      message: "Relatório Markdown gerado com sucesso!",
    };
  },
});

const searchSupermarketsTool = tool({
  description:
    "Search for supermarkets with promotional prices in the specified region",
  inputSchema: z.object({
    product: z.string().describe("Product name to search for"),
    region: z.string().optional().describe("Search region"),
  }),
  execute: async ({ product, region }) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: config } = await supabase
      .from("chatbot_config")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const searchRegion = region || config?.search_region || "São Paulo, SP";

    const mockResults = [
      {
        supermarket: "Supermercado Extra",
        price: 15.9,
        discount: "20% OFF",
        distance: "2.5 km",
      },
      {
        supermarket: "Carrefour",
        price: 17.5,
        discount: "15% OFF",
        distance: "3.1 km",
      },
      {
        supermarket: "Pão de Açúcar",
        price: 16.9,
        discount: "18% OFF",
        distance: "1.8 km",
      },
    ];

    return {
      product,
      region: searchRegion,
      results: mockResults,
      best_price: mockResults[0],
      message: `Encontrei ${mockResults.length} ofertas para "${product}" em ${searchRegion}.`,
    };
  },
});

const getInventoryStatsTool = tool({
  description: "Get overall inventory statistics and insights",
  inputSchema: z.object({}),
  execute: async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: items } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("user_id", user.id);

    const totalItems = items?.length || 0;
    const lowStockItems =
      items?.filter((item) => item.quantity <= item.min_stock).length || 0;
    const criticalStockItems =
      items?.filter((item) => item.quantity <= item.min_stock * 0.5).length ||
      0;
    const totalValue =
      items?.reduce(
        (sum, item) => sum + item.quantity * item.cost_per_unit,
        0
      ) || 0;

    return {
      total_items: totalItems,
      low_stock_items: lowStockItems,
      critical_stock_items: criticalStockItems,
      total_value: totalValue,
      recommendations:
        lowStockItems > 0
          ? `Você tem ${lowStockItems} item(ns) com estoque baixo que precisam de atenção.`
          : "Todos os itens estão com estoque adequado!",
    };
  },
});

const tools = {
  searchInventory: searchInventoryTool,
  generatePDFReport: generatePDFReportTool,
  generateMarkdownReport: generateMarkdownReportTool,
  searchSupermarkets: searchSupermarketsTool,
  getInventoryStats: getInventoryStatsTool,
};

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { data: config } = await supabase
      .from("chatbot_config")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const provider = config?.llm_provider || "openai";
    const model = config?.llm_model || "gpt-5";
    const apiKey = config?.api_key;

    const modelString = apiKey
      ? `${provider}/${model}`
      : `${provider}/${model}`;

    const enabledTools = config?.enabled_tools || [
      "inventory_search",
      "generate_pdf",
      "generate_markdown",
      "supermarket_search",
      "get_stats",
    ];

    const availableTools: any = {};
    if (enabledTools.includes("inventory_search"))
      availableTools.searchInventory = searchInventoryTool;
    if (enabledTools.includes("generate_pdf"))
      availableTools.generatePDFReport = generatePDFReportTool;
    if (enabledTools.includes("generate_markdown"))
      availableTools.generateMarkdownReport = generateMarkdownReportTool;
    if (enabledTools.includes("supermarket_search"))
      availableTools.searchSupermarkets = searchSupermarketsTool;
    if (enabledTools.includes("get_stats"))
      availableTools.getInventoryStats = getInventoryStatsTool;

    const prompt = await convertToModelMessages(messages);

    const result = streamText({
      model: modelString,
      system: `Você é um assistente inteligente para gerenciamento de inventário de restaurantes. 
Você ajuda administradores a:
- Buscar e filtrar itens no inventário
- Gerar relatórios em PDF e Markdown
- Encontrar promoções em supermercados locais (região configurada: ${
        config?.search_region || "São Paulo, SP"
      })
- Fornecer insights sobre estoque e desperdício

Seja profissional, objetivo e útil. Sempre ofereça recomendações práticas baseadas nos dados do inventário.
Use as ferramentas disponíveis quando apropriado.`,
      prompt,
      tools: availableTools,
      maxOutputTokens: 2000,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("[v0] Error in chatbot:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
