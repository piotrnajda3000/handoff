import { Type, type Static } from "@sinclair/typebox";

// Request/Response schemas for the annotate workflow
export const AnnotateRequestSchema = Type.Object({
  fileName: Type.String({
    minLength: 1,
    description: "Name of the file to process",
  }),
  text: Type.String({
    minLength: 1,
    description: "Content of the file to annotate",
  }),
});

export const AnnotateResponseSchema = Type.Object({
  fileName: Type.String({ description: "Name of the processed file" }),
  comments: Type.Array(Type.String(), {
    description: "Array of extracted comments",
  }),
  annotatedText: Type.String({
    description: "The annotated code with markdown headings",
  }),
});

export const ErrorResponseSchema = Type.Object({
  error: Type.String({ description: "Error message" }),
});

// Inferred TypeScript types from TypeBox schemas
export type AnnotateRequest = Static<typeof AnnotateRequestSchema>;
export type AnnotateResponse = Static<typeof AnnotateResponseSchema>;
export type ErrorResponse = Static<typeof ErrorResponseSchema>;
