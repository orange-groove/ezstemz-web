"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";

import { system } from "@/lib/theme";

// Mirrors the structure the Chakra v3 CLI generates for App Router projects:
// ChakraProvider wraps the styling system, ThemeProvider (next-themes) handles
// color-mode persistence with `class` strategy (matches Chakra's _dark
// selector).
export function Provider(props: { children: React.ReactNode } & ThemeProviderProps) {
  const { children, ...rest } = props;
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange {...rest}>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
