import React from "react";
import { MantineProvider } from "@mantine/core";
import "./main.css";

// Create a reusable wrapper that provides the same context as production
export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
);

// For use in main.js/main.tsx
// eslint-disable-next-line react-refresh/only-export-components
export const createAppWrapper = (children: React.ReactNode) => (
  <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
);
