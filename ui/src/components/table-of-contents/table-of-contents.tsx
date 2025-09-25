import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  Text,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import { IconList, IconX, IconChevronRight } from "@tabler/icons-react";

interface HeadingNode {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

// Function to generate a slug from heading text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Function to extract headings from markdown content
function extractHeadings(content: string): HeadingNode[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: HeadingNode[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateSlug(text);

    headings.push({
      id,
      text,
      level,
    });
  }

  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState<HeadingNode[]>([]);

  useEffect(() => {
    const extractedHeadings = extractHeadings(content);
    setHeadings(extractedHeadings);
  }, [content]);

  const scrollToHeading = (id: string) => {
    console.log({ id });
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <ActionIcon
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        variant="filled"
        color="blue"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        aria-label="Toggle Table of Contents"
      >
        <IconList size={20} />
      </ActionIcon>

      {/* Floating ToC Panel */}
      {isOpen && (
        <Box
          style={{
            position: "fixed",
            top: "70px",
            right: "20px",
            width: "300px",
            maxHeight: "60vh",
            backgroundColor: "var(--mantine-color-white)",
            border: "1px solid var(--mantine-color-gray-3)",
            borderRadius: "var(--mantine-radius-md)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            p="md"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-3)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text fw={600} size="sm">
              Table of Contents
            </Text>
            <ActionIcon
              onClick={() => setIsOpen(false)}
              variant="subtle"
              size="sm"
              aria-label="Close Table of Contents"
            >
              <IconX size={16} />
            </ActionIcon>
          </Box>

          {/* Content */}
          <ScrollArea style={{ maxHeight: "calc(60vh - 60px)" }}>
            <Stack gap={4} p="sm">
              {headings.map((heading, index) => (
                <Button
                  key={`${heading.id}-${index}`}
                  variant="subtle"
                  size="compact-xs"
                  leftSection={
                    <IconChevronRight
                      size={12}
                      style={{
                        marginLeft: `${(heading.level - 1) * 12}px`,
                        opacity: 0.6,
                      }}
                    />
                  }
                  onClick={() => scrollToHeading(heading.id)}
                  style={{
                    justifyContent: "flex-start",
                    fontWeight: heading.level <= 2 ? 600 : 400,
                    fontSize: heading.level === 1 ? "14px" : "12px",
                    height: "auto",
                    minHeight: "28px",
                    padding: "6px 8px",
                    textAlign: "left",
                  }}
                  styles={{
                    inner: {
                      justifyContent: "flex-start",
                    },
                  }}
                  fullWidth
                >
                  <Text
                    size={heading.level <= 2 ? "sm" : "xs"}
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: 1.3,
                      textAlign: "left",
                    }}
                  >
                    {heading.text}
                  </Text>
                </Button>
              ))}
            </Stack>
          </ScrollArea>
        </Box>
      )}
    </>
  );
}
