import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./main.css";

// Create a global query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Create a reusable wrapper that provides the same context as production
export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
  </QueryClientProvider>
);

// For use in main.js/main.tsx
// eslint-disable-next-line react-refresh/only-export-components
export const createAppWrapper = (children: React.ReactNode) => (
  <QueryClientProvider client={queryClient}>
    <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
  </QueryClientProvider>
);
