"use client"

import { useEffect, useState } from "react"
import Joyride, { type Step, type CallBackProps, STATUS } from "react-joyride"

interface GuidedTourProps {
  run: boolean
  onComplete: () => void
}

const steps: Step[] = [
  {
    target: "body",
    content: "Bem-vindo ao RestaurantOS! Vamos fazer um tour rápido para você conhecer o sistema.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[href="/dashboard"]',
    content: "Este é o Dashboard, onde você visualiza um resumo completo do seu inventário, desperdícios e alertas.",
    placement: "bottom",
  },
  {
    target: '[href="/inventory"]',
    content:
      "Aqui no Inventário você gerencia todos os seus ingredientes: adicionar, editar, remover e controlar estoque.",
    placement: "bottom",
  },
  {
    target: '[href="/profile"]',
    content: "Na área de Perfil você pode atualizar informações do restaurante e configurações da sua conta.",
    placement: "bottom",
  },
  {
    target: ".theme-toggle",
    content: "Alterne entre modo claro e escuro conforme sua preferência.",
    placement: "bottom",
  },
  {
    target: ".notifications-button",
    content: "As notificações alertam sobre estoque baixo, crítico ou desperdícios. Fique sempre atento!",
    placement: "bottom",
  },
  {
    target: ".settings-button",
    content:
      "Nas Configurações você pode: gerar relatórios PDF, ativar modo alto contraste e configurar este tour guiado.",
    placement: "bottom",
  },
  {
    target: "body",
    content:
      "Pronto! Você já conhece o básico do RestaurantOS. Explore o sistema e qualquer dúvida, inicie o tour novamente pelas Configurações.",
    placement: "center",
  },
]

export function GuidedTour({ run, onComplete }: GuidedTourProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      onComplete()
    }
  }

  if (!isMounted) return null

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--card))",
          arrowColor: "hsl(var(--card))",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "var(--radius)",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "var(--radius)",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  )
}
