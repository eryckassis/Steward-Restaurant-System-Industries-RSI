"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "./animate-ui/icons/user-round";
import { LayoutDashboard, Package, LogOut } from "lucide-react";
import { Settings } from "./animate-ui/icons/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/contexts/profile-context";
import { SettingsDialog } from "@/components/settings-dialog";
import { GuidedTour } from "@/components/guided-tour";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventário", href: "/inventory", icon: Package },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { userProfile, isLoading } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAndStartTour();
  }, []);

  const checkAndStartTour = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const settings = await response.json();
        if (settings.guided_mode) {
          setTimeout(() => setRunTour(true), 1000);
        }
      }
    } catch (error) {
      console.error("[v0] Error checking tour settings:", error);
    }
  };

  const handleTourComplete = async () => {
    setRunTour(false);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guided_mode: false }),
      });
    } catch (error) {
      console.error("[v0] Error updating tour settings:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const userName =
    userProfile?.full_name || userProfile?.email?.split("@")[0] || "Usuário";
  const userEmail = userProfile?.email || "";
  const avatarUrl = userProfile?.avatar_url || undefined;
  const userInitials = userName.substring(0, 2).toUpperCase();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              {!mounted ? (
                <div className="w-15 h-15 rounded-lg bg-muted animate-pulse" />
              ) : (
                <Image
                  src="/LogoPrimario.svg"
                  alt="Logo STEWARD RSI"
                  width={70}
                  height={70}
                  className={`rounded-lg ${isDark ? "invert" : ""}`}
                />
              )}
              <span className="font-bold text-xl">STEWARD RSI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2",
                        pathname === item.href &&
                          "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}

              <Link href="/profile">
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2",
                    pathname === "/profile" &&
                      "bg-secondary text-secondary-foreground"
                  )}
                  onMouseEnter={() => setIsProfileHovered(true)}
                  onMouseLeave={() => setIsProfileHovered(false)}
                >
                  <UserRound
                    className="h-4 w-4"
                    animate={isProfileHovered}
                    animation="path"
                  />
                  Perfil
                </Button>
              </Link>
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="theme-toggle">
              <ThemeToggle />
            </div>

            <div className="notifications-button">
              <NotificationsDropdown />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="settings-button"
              onClick={() => setSettingsOpen(true)}
              onMouseEnter={() => setIsSettingsHovered(true)}
              onMouseLeave={() => setIsSettingsHovered(false)}
              title="Configurações"
            >
              <Settings
                className="h-5 w-5"
                animate={isSettingsHovered && !settingsOpen}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {isLoading ? "Carregando..." : userName}
                    </p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserRound className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onStartTour={() => setRunTour(true)}
      />
      <GuidedTour run={runTour} onComplete={handleTourComplete} />
    </>
  );
}
