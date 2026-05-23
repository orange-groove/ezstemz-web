"use client";

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Brand palette is a warm magenta → orange gradient that pairs with the
// audio-waveform-on-dark vibe of the desktop app. Tweak the 500 hue if the
// product gets a stronger brand identity later.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fff1f2" },
          100: { value: "#ffe1e6" },
          200: { value: "#ffc2cc" },
          300: { value: "#ff97aa" },
          400: { value: "#ff5d7f" },
          500: { value: "#ff2d6b" },
          600: { value: "#e91661" },
          700: { value: "#c30c54" },
          800: { value: "#a00d4b" },
          900: { value: "#820e44" },
          950: { value: "#480020" },
        },
      },
      fonts: {
        heading: {
          value:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        body: {
          value:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        mono: {
          value:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        },
      },
    },
    semanticTokens: {
      colors: {
        // Map "brand" semantic tokens to the brand scale; consumers can write
        // `colorPalette="brand"` and pick up these slots automatically.
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.50}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
