import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChefHat, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <ChefHat className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">RestaurantOS</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Verifique seu email</CardTitle>
              <CardDescription className="text-center">
                Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-lg bg-muted p-4 text-sm text-center">
                <p className="text-muted-foreground">
                  Não recebeu o email? Verifique sua pasta de spam ou tente novamente mais tarde.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/login">Voltar para o login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
