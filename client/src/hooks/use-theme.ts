import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  // Initial state with safe default that works server-side
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Initialize theme from localStorage only on client side
  useEffect(() => {
    // Safe check for window to avoid SSR issues
    if (typeof window === "undefined") return;
    
    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    
    // Set initial resolved theme
    if (storedTheme === "system" || !storedTheme) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(storedTheme as "dark" | "light");
    }
  }, []);

  useEffect(() => {
    // Safe check for window to avoid SSR issues
    if (typeof window === "undefined") return;
    
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      setResolvedTheme(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Safe check for window to avoid SSR issues
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(systemTheme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(systemTheme);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
  };
}
