import { Type, type Static } from "@sinclair/typebox";

// Request/Response schemas for the annotate workflow
export const AnnotateRequestItemSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    description: "Name of the file to process",
  }),
  text: Type.String({
    minLength: 1,
    description: "Content of the file to annotate",
  }),
  path: Type.String({
    minLength: 1,
    description: "Path of the file to process",
  }),
  dependents: Type.Array(
    Type.Object({
      name: Type.String(),
      path: Type.String(),
    }),
    {
      description: "Array of dependent files",
    }
  ),
});
export const AnnotateRequestSchema = Type.Array(AnnotateRequestItemSchema);
export type AnnotateRequestItem = Static<typeof AnnotateRequestItemSchema>;
export type AnnotateRequest = Static<typeof AnnotateRequestSchema>;

export const AnnotateResponseSchema = Type.Object({
  path: Type.String({ description: "Path of the processed file" }),
  annotations: Type.Array(Type.String(), {
    description: "Array of extracted annotations",
  }),
  annotatedText: Type.String({
    description: "The annotated code with markdown headings",
  }),
});
export type AnnotateResponse = Static<typeof AnnotateResponseSchema>;

const DependencyAnalyzeResponseSchema = Type.Object({
  analysis: Type.String({ description: "Analysis of the file" }),
});

export const GenerateReportResponseSchema = Type.Object({
  report: Type.String({ description: "Report of the files" }),
  files: Type.Array(
    Type.Object({
      ...AnnotateRequestItemSchema.properties,
      ...AnnotateResponseSchema.properties,
      dependents: Type.Array(
        Type.Object({
          ...AnnotateRequestItemSchema.properties.dependents.items.properties,
          ...DependencyAnalyzeResponseSchema.properties,
        })
      ),
    })
  ),
});
export type GenerateReportResponse = Static<
  typeof GenerateReportResponseSchema
>;

// Other stuff

export const ErrorResponseSchema = Type.Object({
  error: Type.String({ description: "Error message" }),
});

// Repository connection schemas
export const RepoConnectionSchema = Type.Object({
  provider: Type.Union([
    Type.Literal("github"),
    Type.Literal("gitlab"),
    Type.Literal("bitbucket"),
  ]),
  url: Type.String({ description: "Repository URL" }),
  token: Type.String({ description: "Access token" }),
  owner: Type.String({ description: "Repository owner" }),
  repo: Type.String({ description: "Repository name" }),
});

export const RepoTestConnectionRequestSchema = Type.Object({
  provider: Type.Union([
    Type.Literal("github"),
    Type.Literal("gitlab"),
    Type.Literal("bitbucket"),
  ]),
  owner: Type.String({ description: "Repository owner" }),
  repo: Type.String({ description: "Repository name" }),
  token: Type.String({ description: "Access token" }),
});

export const RepoFileSchema = Type.Object({
  path: Type.String({ description: "File path" }),
  name: Type.String({ description: "File name" }),
  type: Type.Union([Type.Literal("file"), Type.Literal("dir")]),
  size: Type.Optional(Type.Number({ description: "File size in bytes" })),
  sha: Type.Optional(Type.String({ description: "Git SHA hash" })),
});

export const RepoListFilesRequestSchema = RepoConnectionSchema;

export const RepoListFilesResponseSchema = Type.Array(RepoFileSchema);

export const RepoGetFileContentRequestSchema = Type.Object({
  connection: RepoConnectionSchema,
  filePath: Type.String({ description: "Path to the file to retrieve" }),
});

export const RepoGetFileContentResponseSchema = Type.Object({
  content: Type.String({ description: "Base64 decoded file content" }),
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

export type RepoConnection = Static<typeof RepoConnectionSchema>;
export type RepoTestConnectionRequest = Static<
  typeof RepoTestConnectionRequestSchema
>;
export type RepoFile = Static<typeof RepoFileSchema>;
export type RepoListFilesRequest = Static<typeof RepoListFilesRequestSchema>;
export type RepoListFilesResponse = Static<typeof RepoListFilesResponseSchema>;
export type RepoGetFileContentRequest = Static<
  typeof RepoGetFileContentRequestSchema
>;
export type RepoGetFileContentResponse = Static<
  typeof RepoGetFileContentResponseSchema
>;
