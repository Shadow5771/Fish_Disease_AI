import type { ScreeningResponse } from "../types/screening";

export class ApiRequestError extends Error {
  code: string;
  status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.status = status;
  }
}

const UNAVAILABLE_MESSAGE =
  "The analysis service is not reachable. Make sure the backend is running and try again.";

export async function screenImage(
  file: File,
  signal?: AbortSignal,
): Promise<ScreeningResponse> {
  const body = new FormData();
  body.append("file", file);

  let res: Response;
  try {
    res = await fetch("/api/screen", { method: "POST", body, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiRequestError("BACKEND_UNAVAILABLE", UNAVAILABLE_MESSAGE);
  }

  if (!res.ok) {
    let payload: { error?: { code?: string; message?: string } } | null = null;
    try {
      payload = await res.json();
    } catch {
      // body was not JSON (for example a proxy error page)
    }
    if (payload?.error?.code && payload.error.message) {
      throw new ApiRequestError(payload.error.code, payload.error.message, res.status);
    }
    throw new ApiRequestError("BACKEND_UNAVAILABLE", UNAVAILABLE_MESSAGE, res.status);
  }

  return (await res.json()) as ScreeningResponse;
}