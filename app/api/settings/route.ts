import { ReportData } from "./../../../lib/types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  const supabase = await createClient();
  const authResult = await requireAuth(supabase);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { userId } = authResult;

  try {
    const { data: settings, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    // If no settings exist, create default ones with correct schema columns
    if (!settings) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const { data: newSettings, error: insertError } = await supabase
        .from("system_settings")
        .insert({
          user_id: userId,
          next_report_date: nextMonth.toISOString().split("T")[0],
          high_contrast_mode: false,
          guided_mode: true,
          two_factor_enabled: false,
          two_factor_method: null,
          waste_safe_threshold: 100.0,
          waste_critical_threshold: 300.0,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return NextResponse.json(newSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[v0] Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const authResult = await requireAuth(supabase);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { userId } = authResult;

  try {
    const updates = await request.json();

    if (
      updates.waste_safe_threshold !== undefined ||
      updates.waste_critical_threshold !== undefined
    ) {
      const currentSettings = await supabase
        .from("system_settings")
        .select("waste_safe_threshold, waste_critical_threshold")
        .eq("user_id", userId)
        .single();

      const safeThreshold =
        updates.waste_safe_threshold ??
        currentSettings.data?.waste_safe_threshold ??
        100;
      const criticalThreshold =
        updates.waste_critical_threshold ??
        currentSettings.data?.waste_critical_threshold ??
        300;

      if (safeThreshold >= criticalThreshold) {
        return NextResponse.json(
          { error: "O limite seguro deve ser menor que o limite crítico" },
          { status: 400 }
        );
      }

      if (safeThreshold < 0 || criticalThreshold < 0) {
        return NextResponse.json(
          { error: "Os limites devem ser valores positivos" },
          { status: 400 }
        );
      }
    }

    if (updates.next_report_date) {
      const reportDate = new Date(updates.next_report_date);
      if (isNaN(reportDate.getTime())) {
        return NextResponse.json(
          { error: "Data inválida para relatório" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("system_settings")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("[v0] Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
