import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../utils/api";
import type { AnnotateRequest, AnnotateResponse } from "handoff-server/schemas";

interface UseAnnotateOptions {
  onSuccess?: (data: AnnotateResponse) => void;
  onError?: (error: Error) => void;
}

export const useAnnotate = (options?: UseAnnotateOptions) => {
  return useMutation<AnnotateResponse, Error, AnnotateRequest>({
    mutationFn: async (request: AnnotateRequest) => {
      return apiPost<AnnotateRequest, AnnotateResponse>({
        endpoint: "/annotate",
        body: request,
      });
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
