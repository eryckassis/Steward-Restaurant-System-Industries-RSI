import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const limit = searchParams.get("limit") || "20"

    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Number.parseInt(limit))

    if (unreadOnly) {
      query = query.eq("read", false)
    }

    const { data, error } = await query

    if (error) {
      // Tabela pode não existir ainda
      if (error.code === "42P01") {
        return NextResponse.json([])
      }
      console.error("Error fetching notifications:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in notifications API:", error)
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, read } = body

    if (id === "all") {
      // Marcar todas como lidas
      const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Marcar uma específica
      const { error } = await supabase.from("notifications").update({ read }).eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id === "all") {
      const { error } = await supabase.from("notifications").delete().eq("read", true)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else if (id) {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
