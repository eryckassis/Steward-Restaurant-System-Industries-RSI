"use client"

import type React from "react"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { getCroppedImg, validateImageFile, checkImageDimensions } from "@/lib/image-utils"
import { Upload, Square, Circle } from "lucide-react"

interface ImageCropUploadProps {
  onImageCropped: (blob: Blob) => Promise<void>
  currentImage?: string | null
  aspectRatio?: number // 1 for square, undefined for circle
  title?: string
  description?: string
}

export function ImageCropUpload({
  onImageCropped,
  currentImage,
  aspectRatio = 1,
  title = "Upload de Imagem",
  description = "Selecione e recorte sua imagem",
}: ImageCropUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [cropShape, setCropShape] = useState<"rect" | "round">("rect")
  const { toast } = useToast()

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Validate file
      const fileValidation = validateImageFile(file)
      if (!fileValidation.valid) {
        toast({
          title: "Erro",
          description: fileValidation.error,
          variant: "destructive",
        })
        return
      }

      // Check dimensions
      const dimensionValidation = await checkImageDimensions(file)
      if (!dimensionValidation.valid) {
        toast({
          title: "Erro",
          description: dimensionValidation.error,
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string)
      })
      reader.readAsDataURL(file)
    }
  }

  const handleCropImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setIsUploading(true)

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      await onImageCropped(croppedBlob)

      setImageSrc(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso",
      })
    } catch (error) {
      console.error("Error cropping image:", error)
      toast({
        title: "Erro",
        description: "Não foi possível processar a imagem",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {currentImage && (
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-border">
              <img src={currentImage || "/placeholder.svg"} alt="Current" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 hover:border-primary transition-colors">
                <Upload className="h-5 w-5" />
                <span className="text-sm">Clique para selecionar uma imagem</span>
              </div>
              <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </Label>
            <p className="text-xs text-muted-foreground mt-2">Tamanho máximo: 5MB. Resolução máxima: 3840px</p>
          </div>
        </div>
      </div>

      <Dialog open={!!imageSrc} onOpenChange={() => setImageSrc(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative h-[400px] w-full bg-muted rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  cropShape={cropShape}
                  showGrid={true}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={cropShape === "rect" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCropShape("rect")}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Quadrado
                </Button>
                <Button
                  type="button"
                  variant={cropShape === "round" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCropShape("round")}
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Circular
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Zoom</Label>
                <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(value) => setZoom(value[0])} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImageSrc(null)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button onClick={handleCropImage} disabled={isUploading}>
              {isUploading ? "Enviando..." : "Salvar Imagem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
