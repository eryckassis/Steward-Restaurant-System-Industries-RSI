"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ImageCropUpload } from "@/components/image-crop-upload"
import type { UserProfile } from "@/lib/types"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, Mail } from "lucide-react"

interface UserProfileSectionProps {
  initialUser: UserProfile
  onUpdate: (user: UserProfile) => void
}

export function UserProfileSection({ initialUser, onUpdate }: UserProfileSectionProps) {
  const [user, setUser] = useState<UserProfile>(initialUser)
  const [fullName, setFullName] = useState(initialUser.full_name)
  const [email, setEmail] = useState(initialUser.email)
  const [saving, setSaving] = useState(false)
  const [resending, setResending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setUser(initialUser)
    setFullName(initialUser.full_name)
    setEmail(initialUser.email)
  }, [initialUser])

  const handleAvatarUpload = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", blob, "avatar.jpg")

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Upload failed")

      const { url } = await uploadResponse.json()

      const updateResponse = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: url }),
      })

      if (!updateResponse.ok) throw new Error("Failed to update avatar")

      const updatedUser = await updateResponse.json()
      setUser(updatedUser)
      onUpdate(updatedUser)

      toast({
        title: "Sucesso",
        description: "Avatar atualizado com sucesso",
      })
    } catch (error) {
      console.error("Error updating avatar:", error)
      throw error
    }
  }

  const handleUpdateProfile = async () => {
    setSaving(true)

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const updatedUser = await response.json()
      setUser(updatedUser)
      onUpdate(updatedUser)

      toast({
        title: "Sucesso",
        description: "Nome atualizado com sucesso",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (email === user.email) {
      toast({
        title: "Aviso",
        description: "O email não foi alterado",
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })

      if (!response.ok) throw new Error("Failed to update email")

      const result = await response.json()

      toast({
        title: "Email de Confirmação Enviado",
        description: result.message || "Verifique sua caixa de entrada para confirmar o novo email",
      })
    } catch (error) {
      console.error("Error updating email:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o email",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResendVerification = async () => {
    setResending(true)

    try {
      const response = await fetch("/api/user/resend-verification", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to resend verification")

      toast({
        title: "Sucesso",
        description: "Email de verificação reenviado",
      })
    } catch (error) {
      console.error("Error resending verification:", error)
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o email de verificação",
        variant: "destructive",
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
        <CardDescription>Gerencie suas informações pessoais e de conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!user.email_verified && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Seu email ainda não foi verificado. Verifique sua caixa de entrada.</span>
              <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={resending}>
                <Mail className="mr-2 h-4 w-4" />
                {resending ? "Enviando..." : "Reenviar"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Foto de Perfil</Label>
          <ImageCropUpload
            currentImage={user.avatar_url}
            onImageCropped={handleAvatarUpload}
            title="Foto de Perfil"
            description="Escolha uma foto que represente você"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
              <Button onClick={handleUpdateProfile} disabled={saving || fullName === user.full_name}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email
              {user.email_verified ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Não Verificado
                </Badge>
              )}
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              <Button onClick={handleUpdateEmail} disabled={saving || email === user.email}>
                {saving ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Ao alterar o email, você receberá um link de confirmação no novo endereço.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
