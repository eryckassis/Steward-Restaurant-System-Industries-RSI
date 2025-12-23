import { createClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()

    // Get the first profile or return default
    const { data, error } = await supabase.from("restaurant_profile").select("*").limit(1).maybeSingle()

    if (error) {
      console.error("Profile fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no profile exists, return default values
    if (!data) {
      return NextResponse.json({
        id: null,
        name: "Meu Restaurante",
        email: user.email || "contato@restaurante.com",
        phone: "(11) 98765-4321",
        address: "Rua Exemplo, 123",
        city: "São Paulo",
        state: "SP",
        zip_code: "01234-567",
        country: "Brasil",
        logo_url: null,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
      return unauthorizedResponse()
    }

    const supabase = await createClient()
    const body = await request.json()

    const { data: existingProfile } = await supabase.from("restaurant_profile").select("id").limit(1).maybeSingle()

    let data

    if (!existingProfile) {
      // Insert new profile
      const { data: newProfile, error: insertError } = await supabase
        .from("restaurant_profile")
        .insert({
          name: body.name,
          email: body.email,
          phone: body.phone,
          address: body.address,
          city: body.city,
          state: body.state,
          zip_code: body.zip_code,
          country: body.country,
          logo_url: body.logo_url,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Profile insert error:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      data = newProfile
    } else {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from("restaurant_profile")
        .update({
          name: body.name,
          email: body.email,
          phone: body.phone,
          address: body.address,
          city: body.city,
          state: body.state,
          zip_code: body.zip_code,
          country: body.country,
          logo_url: body.logo_url,
        })
        .eq("id", existingProfile.id)
        .select()
        .single()

      if (updateError) {
        console.error("Profile update error:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      data = updatedProfile
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
