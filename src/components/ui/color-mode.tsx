"use client";

import type { IconButtonProps } from "@chakra-ui/react";
import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { forwardRef } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export type ColorMode = "light" | "dark";

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };
  return {
    colorMode: (resolvedTheme as ColorMode) ?? "light",
    setColorMode: setTheme,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
}

// ColorModeButton is the standard Chakra snippet output. Wrapped in ClientOnly
// so the icon doesn't flash on hydration when next-themes hasn't resolved yet.
export const ColorModeButton = forwardRef<HTMLButtonElement, Omit<IconButtonProps, "aria-label">>(
  function ColorModeButton(props, ref) {
    const { toggleColorMode, colorMode } = useColorMode();
    return (
      <ClientOnly fallback={<Skeleton boxSize="8" />}>
        <IconButton
          ref={ref}
          onClick={toggleColorMode}
          variant="ghost"
          aria-label="Toggle color mode"
          size="sm"
          {...props}
        >
          {colorMode === "dark" ? <LuSun /> : <LuMoon />}
        </IconButton>
      </ClientOnly>
    );
  },
);
