import React from "react";
import { MantineProvider } from "@mantine/core";
import "./main.css";

// Create a reusable wrapper that provides the same context as production
export const TestWrapper = ({ children }) => (
  <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
);

// For use in main.js/main.tsx
export const createAppWrapper = (children) => (
  <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
);
