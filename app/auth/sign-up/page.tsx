"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChefHat, Mail, Phone, Loader2, CheckCircle2, XCircle } from "lucide-react"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

const validateEmail = (email: string): { valid: boolean; message: string } => {
  if (!email) return { valid: false, message: "Email é obrigatório" }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { valid: false, message: "Email inválido" }
  return { valid: true, message: "" }
}

const validatePassword = (password: string): { valid: boolean; message: string; strength: number } => {
  if (!password) return { valid: false, message: "Senha é obrigatória", strength: 0 }
  if (password.length < 8) return { valid: false, message: "Mínimo 8 caracteres", strength: 1 }

  let strength = 1
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  if (strength < 3) return { valid: false, message: "Senha fraca. Adicione maiúsculas, números ou símbolos", strength }
  return { valid: true, message: "", strength }
}

const validatePhone = (phone: string): { valid: boolean; message: string } => {
  if (!phone) return { valid: false, message: "Telefone é obrigatório" }
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length < 10 || cleaned.length > 13) {
    return { valid: false, message: "Telefone inválido. Use formato: +55 11 99999-9999" }
  }
  return { valid: true, message: "" }
}

const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length <= 2) return `+${cleaned}`
  if (cleaned.length <= 4) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
  if (cleaned.length <= 9) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`
  return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9, 13)}`
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const router = useRouter()

  const emailValidation = validateEmail(email)
  const passwordValidation = validatePassword(password)
  const phoneValidation = validatePhone(phone)
  const passwordsMatch = password === repeatPassword

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!emailValidation.valid) {
      setError(emailValidation.message)
      setIsLoading(false)
      return
    }

    if (!passwordValidation.valid) {
      setError(passwordValidation.message)
      setIsLoading(false)
      return
    }

    if (!passwordsMatch) {
      setError("As senhas não correspondem")
      setIsLoading(false)
      return
    }

    if (!restaurantName.trim()) {
      setError("Nome do restaurante é obrigatório")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Erro ao conectar com o servidor")
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            restaurant_name: restaurantName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Erro ao conectar com o servidor")
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta com Google")
      setIsGoogleLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setIsLoading(true)
    setError(null)

    if (!phoneValidation.valid) {
      setError(phoneValidation.message)
      setIsLoading(false)
      return
    }

    if (!restaurantName.trim()) {
      setError("Nome do restaurante é obrigatório")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Erro ao conectar com o servidor")
      }

      const cleanedPhone = phone.replace(/\D/g, "")
      const formattedPhone = cleanedPhone.startsWith("55") ? `+${cleanedPhone}` : `+55${cleanedPhone}`

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: {
            restaurant_name: restaurantName,
          },
        },
      })

      if (error) throw error
      setOtpSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao enviar código SMS")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsLoading(true)
    setError(null)

    if (otp.length !== 6) {
      setError("O código deve ter 6 dígitos")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      if (!supabase) {
        throw new Error("Erro ao conectar com o servidor")
      }

      const cleanedPhone = phone.replace(/\D/g, "")
      const formattedPhone = cleanedPhone.startsWith("55") ? `+${cleanedPhone}` : `+55${cleanedPhone}`

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      })

      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Código inválido ou expirado")
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-destructive"
    if (strength === 2) return "bg-orange-500"
    if (strength === 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return "Muito fraca"
    if (strength === 2) return "Fraca"
    if (strength === 3) return "Média"
    if (strength === 4) return "Forte"
    return "Muito forte"
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <ChefHat className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">RestaurantOS</h1>
            <p className="text-sm text-muted-foreground">Gestão inteligente de inventário</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Criar Conta</CardTitle>
              <CardDescription>Escolha como deseja se cadastrar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4 gap-2 bg-transparent"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
                {isGoogleLoading ? "Conectando..." : "Criar conta com Google"}
              </Button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="gap-2">
                    <Phone className="h-4 w-4" />
                    SMS
                  </TabsTrigger>
                </TabsList>

                {/* Email signup tab */}
                <TabsContent value="email">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-name">Nome do Restaurante</Label>
                      <Input
                        id="restaurant-name"
                        type="text"
                        placeholder="Meu Restaurante"
                        required
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={email && !emailValidation.valid ? "border-destructive" : ""}
                        />
                        {email && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {emailValidation.valid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                      {email && !emailValidation.valid && (
                        <p className="text-xs text-destructive">{emailValidation.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {password && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                  i <= passwordValidation.strength
                                    ? getStrengthColor(passwordValidation.strength)
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Força: {getStrengthText(passwordValidation.strength)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repeat-password">Confirmar Senha</Label>
                      <div className="relative">
                        <Input
                          id="repeat-password"
                          type="password"
                          required
                          value={repeatPassword}
                          onChange={(e) => setRepeatPassword(e.target.value)}
                          className={repeatPassword && !passwordsMatch ? "border-destructive" : ""}
                        />
                        {repeatPassword && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {passwordsMatch ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                      {repeatPassword && !passwordsMatch && (
                        <p className="text-xs text-destructive">As senhas não correspondem</p>
                      )}
                    </div>

                    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !emailValidation.valid || !passwordValidation.valid || !passwordsMatch}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar Conta"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* SMS signup tab */}
                <TabsContent value="sms">
                  <div className="space-y-4">
                    {!otpSent ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="restaurant-name-sms">Nome do Restaurante</Label>
                          <Input
                            id="restaurant-name-sms"
                            type="text"
                            placeholder="Meu Restaurante"
                            required
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Número de Celular</Label>
                          <div className="relative">
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+55 11 99999-9999"
                              required
                              value={phone}
                              onChange={(e) => setPhone(formatPhone(e.target.value))}
                              className={phone && !phoneValidation.valid ? "border-destructive" : ""}
                            />
                            {phone && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {phoneValidation.valid ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                            )}
                          </div>
                          {phone && !phoneValidation.valid && (
                            <p className="text-xs text-destructive">{phoneValidation.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Enviaremos um código de verificação por SMS</p>
                        </div>

                        {error && (
                          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                        )}

                        <Button
                          type="button"
                          className="w-full"
                          disabled={isLoading || !phoneValidation.valid || !restaurantName.trim()}
                          onClick={handleSendOtp}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            "Enviar Código SMS"
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-center space-y-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
                            <Phone className="h-6 w-6 text-primary" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Código enviado para <strong>{phone}</strong>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="otp">Código de Verificação</Label>
                          <Input
                            id="otp"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="text-center text-2xl tracking-widest"
                          />
                        </div>

                        {error && (
                          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                        )}

                        <Button
                          type="button"
                          className="w-full"
                          disabled={isLoading || otp.length !== 6}
                          onClick={handleVerifyOtp}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            "Verificar Código"
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            setOtpSent(false)
                            setOtp("")
                            setError(null)
                          }}
                        >
                          Alterar número
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 text-center text-sm">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="font-medium underline underline-offset-4 hover:text-primary">
                  Fazer login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
