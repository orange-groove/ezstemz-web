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

  // next-themes injects an inline <script> to prevent theme flicker on load.
  // React 19 warns when that script re-renders on the client; SSR still emits
  // a normal executable script, client passes use a non-executed type instead.
  const scriptProps =
    typeof window === "undefined" ? undefined : ({ type: "application/json" } as const);

  return (
    <ChakraProvider value={system}>
      <ThemeProvider
        attribute="class"
        disableTransitionOnChange
        scriptProps={scriptProps}
        {...rest}
      >
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
