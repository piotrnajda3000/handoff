import { Box, type BoxProps } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface MarkdownRendererProps extends Omit<BoxProps, "children"> {
  content: string;
  className?: string;
}

// Function to generate a slug from heading text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("object-", "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Custom components for react-markdown to add IDs to headings
const components: Components = {
  h1: ({ children, node }) => {
    const text = children?.toString() || "";
    const id = generateSlug(text);
    return <h1 id={id}>{children}</h1>;
  },
  h2: ({ children }) => {
    const text = children?.toString() || "";
    const id = generateSlug(text);
    return <h2 id={id}>{children}</h2>;
  },
  h3: ({ children }) => {
    const text = children?.toString() || "";
    const id = generateSlug(text);
    return <h3 id={id}>{children}</h3>;
  },
  h4: ({ children }) => {
    const text = children?.toString() || "";
    const id = generateSlug(text);
    return <h4 id={id}>{children}</h4>;
  },
  h5: ({ children }) => {
    const text = children?.toString() || "";
    const id = generateSlug(text);
    return <h5 id={id}>{children}</h5>;
  },
  h6: ({ children }) => {
    const text = children?.toString() || "";
    const id = generateSlug(text);
    return <h6 id={id}>{children}</h6>;
  },
};

export function MarkdownRenderer({
  content,
  className = "",
  ...boxProps
}: MarkdownRendererProps) {
  return (
    <Box {...boxProps} className={`prose ${className}`}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </Box>
  );
}
