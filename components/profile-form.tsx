"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RestaurantProfile } from "@/lib/types"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProfileFormProps {
  profile: RestaurantProfile
  onUpdate: (profile: RestaurantProfile) => void
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    zip_code: profile.zip_code,
    country: profile.country,
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          ...formData,
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const updatedProfile = await response.json()
      onUpdate(updatedProfile)

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip_code: profile.zip_code,
      country: profile.country,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Restaurante</Label>
          <Input id="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_code">CEP</Label>
          <Input id="zip_code" value={formData.zip_code} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço Completo</Label>
        <Input id="address" value={formData.address} onChange={handleChange} required />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" value={formData.state} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input id="country" value={formData.country} onChange={handleChange} required />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
