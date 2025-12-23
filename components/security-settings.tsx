"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, Lock, Smartphone, Mail, CheckCircle2 } from "lucide-react"
import type { UserProfile } from "@/lib/types"

interface SecuritySettingsProps {
  user: UserProfile
  onUpdate: (user: UserProfile) => void
}

export function SecuritySettings({ user, onUpdate }: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState(user.phone || "")
  const [twoFactorMethod, setTwoFactorMethod] = useState<"email" | "sms">("email")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to change password")
      }

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    if (twoFactorMethod === "sms" && !phone) {
      toast({
        title: "Erro",
        description: "Adicione um número de telefone primeiro",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/user/enable-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: twoFactorMethod,
          phone: twoFactorMethod === "sms" ? phone : undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to enable 2FA")

      const updatedUser = await response.json()
      onUpdate(updatedUser)

      toast({
        title: "Sucesso",
        description: `Autenticação de 2 fatores ativada via ${twoFactorMethod === "email" ? "email" : "SMS"}`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível ativar a autenticação de 2 fatores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/user/disable-2fa", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to disable 2FA")

      const updatedUser = await response.json()
      onUpdate(updatedUser)

      toast({
        title: "Sucesso",
        description: "Autenticação de 2 fatores desativada",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desativar a autenticação de 2 fatores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
            />
          </div>

          <Button onClick={handleChangePassword} disabled={loading || !currentPassword || !newPassword}>
            {loading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Autenticação de 2 Fatores (2FA)
              </CardTitle>
              <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
            </div>
            {user.two_factor_enabled && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Ativo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user.email_verified && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Você precisa verificar seu email antes de ativar a autenticação de 2 fatores.
              </AlertDescription>
            </Alert>
          )}

          {user.email_verified && !user.two_factor_enabled && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Método de Autenticação</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={twoFactorMethod === "email" ? "default" : "outline"}
                      onClick={() => setTwoFactorMethod("email")}
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={twoFactorMethod === "sms" ? "default" : "outline"}
                      onClick={() => setTwoFactorMethod("sms")}
                      className="flex-1"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      SMS
                    </Button>
                  </div>
                </div>

                {twoFactorMethod === "sms" && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Número de Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleEnable2FA} disabled={loading}>
                {loading ? "Ativando..." : "Ativar 2FA"}
              </Button>
            </>
          )}

          {user.two_factor_enabled && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  A autenticação de 2 fatores está ativa. Você receberá um código de verificação sempre que fizer login.
                </AlertDescription>
              </Alert>

              <Button variant="destructive" onClick={handleDisable2FA} disabled={loading}>
                {loading ? "Desativando..." : "Desativar 2FA"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
