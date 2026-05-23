import { Box } from "@chakra-ui/react";

import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";

// Server component shell shared by every marketing-style page (landing,
// pricing, account, etc). Keeps nav / footer / global page padding consistent
// without forcing a route group layout.
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" display="flex" flexDirection="column">
      <SiteNav />
      <Box as="main" flex="1">
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}
