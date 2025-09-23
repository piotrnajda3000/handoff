const API_BASE_URL = "http://localhost:8080"; // Adjust based on your server port

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface PostOptions<T = unknown> {
  endpoint: string;
  body: T;
  headers?: Record<string, string>;
}

/**
 * Generic POST request wrapper with proper error handling
 */
export async function apiPost<TRequest, TResponse>(
  options: PostOptions<TRequest>
): Promise<TResponse> {
  const { endpoint, body, headers = {} } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, use default error
    }

    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}
