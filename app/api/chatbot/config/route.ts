import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("chatbot_config")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching chatbot config:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        llm_provider: "openai",
        llm_model: "gpt-5",
        api_key: null,
        search_region: "São Paulo, SP",
        enabled_tools: [
          "inventory_search",
          "generate_pdf",
          "generate_markdown",
          "supermarket_search",
        ],
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[v0] Error in chatbot config GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { llm_provider, llm_model, api_key, search_region, enabled_tools } =
      body;

    if (!llm_provider || !llm_model) {
      return NextResponse.json(
        { error: "Provider and model are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chatbot_config")
      .upsert({
        user_id: user.id,
        llm_provider,
        llm_model,
        api_key,
        search_region,
        enabled_tools,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Error upserting chatbot config:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[v0] Error in chatbot config POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
