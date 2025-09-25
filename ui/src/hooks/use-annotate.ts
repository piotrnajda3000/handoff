import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../utils/api";
import type {
  AnnotateRequest,
  GenerateReportResponse,
} from "handoff-server/schemas";

interface UseAnnotateOptions {
  onSuccess?: (data: GenerateReportResponse) => void;
  onError?: (error: Error) => void;
}

export const useAnnotate = (options?: UseAnnotateOptions) => {
  return useMutation<GenerateReportResponse, Error, AnnotateRequest>({
    mutationFn: async (request: AnnotateRequest) => {
      // return Promise.resolve(MOCK_REPORT);
      return apiPost<AnnotateRequest, GenerateReportResponse>({
        endpoint: "/generate-report",
        body: request,
      });
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
