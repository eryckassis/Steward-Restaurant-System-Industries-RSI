"use client";

import * as React from "react";
import { MoonStar } from "./animate-ui/icons/moon-star";
import { Sun } from "./animate-ui/icons/sun";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Alternar tema"
    >
      {isDark ? (
        <MoonStar className="h-5 w-5" animate={isHovered} />
      ) : (
        <Sun className="h-5 w-5" animate={isHovered} />
      )}
    </Button>
  );
}
