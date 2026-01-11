"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ProfileForm } from "@/components/profile-form";
import { UserProfileSection } from "@/components/user-profile-section";
import { SecuritySettings } from "@/components/security-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Phone, MapPin, User, Shield } from "lucide-react";
import type { RestaurantProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/lib/contexts/profile-context";
import { ImageCropUpload } from "@/components/image-crop-upload";

export default function ProfilePage() {
  const { restaurantProfile, userProfile, refreshProfiles, isLoading } =
    useProfile();

  const { toast } = useToast();

  const handleLogoUpload = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", blob, "restaurant-logo.jpg");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      const uploadData = await uploadResponse.json();

      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...restaurantProfile,
          logo_url: uploadData.url,
        }),
      });

      if (!profileResponse.ok) throw new Error("Failed to update profile");

      await refreshProfiles();

      toast({
        title: "Sucesso",
        description: "Logo do restaurante atualizada com sucesso",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  };

  const handleProfileUpdate = async () => {
    await refreshProfiles();
  };

  const handleUserUpdate = async () => {
    await refreshProfiles();
  };

  if (isLoading || !restaurantProfile || !userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
              <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const restaurantInitials = restaurantProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as informações do seu restaurante e usuário
          </p>
        </div>

        <Tabs defaultValue="user" className="space-y-6">
          <TabsList>
            <TabsTrigger value="user">
              <User className="h-4 w-4 mr-2" />
              Perfil do Usuário
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="restaurant">
              <Building2 className="h-4 w-4 mr-2" />
              Restaurante
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-6">
            <UserProfileSection
              initialUser={userProfile}
              onUpdate={handleUserUpdate}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings user={userProfile} onUpdate={handleUserUpdate} />
          </TabsContent>

          <TabsContent value="restaurant" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Informações do Restaurante</CardTitle>
                  <CardDescription>
                    Logo e detalhes do estabelecimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={restaurantProfile.logo_url || undefined}
                      />
                      <AvatarFallback className="text-2xl">
                        {restaurantInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">
                        {restaurantProfile.name}
                      </h3>
                    </div>

                    <div className="w-full">
                      <ImageCropUpload
                        currentImage={restaurantProfile.logo_url}
                        onImageCropped={handleLogoUpload}
                        title="Logo do Restaurante"
                        description="Escolha uma imagem que represente seu restaurante"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{restaurantProfile.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{restaurantProfile.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{restaurantProfile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {restaurantProfile.city}, {restaurantProfile.state}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Editar Perfil do Restaurante</CardTitle>
                  <CardDescription>
                    Atualize as informações do seu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm
                    profile={restaurantProfile}
                    onUpdate={handleProfileUpdate}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
