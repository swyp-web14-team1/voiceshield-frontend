import type { ApiResponse } from "./types";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const REQUEST_TIMEOUT_MS = 8000;
const USER_ID_STORAGE_KEY = "voiceshield-api-user-id";

export class ApiUnavailableError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiUnavailableError";
    this.status = status;
  }
}


export function setStoredUserId(userId: string | null) {
  if (typeof window === "undefined") return;
  if (userId) localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  else localStorage.removeItem(USER_ID_STORAGE_KEY);
}

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_STORAGE_KEY);
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}


export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiUnavailableError("NEXT_PUBLIC_API_BASE_URL이 설정되어 있지 않습니다.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const userId = getStoredUserId();
  if (userId) headers["X-User-Id"] = userId;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res
        .json()
        .then((b: ApiResponse<unknown>) => (b.error ? `${b.error.code} ${b.error.message}` : null))
        .catch(() => null);
      throw new ApiUnavailableError(detail ? `API 요청 실패: ${res.status} (${detail})` : `API 요청 실패: ${res.status}`, res.status);
    }

    // DELETE 등 일부 엔드포인트는 200이어도 응답 본문이 아예 없다 — 그런 경우는 성공으로 간주하고 null을 돌려준다.
    const rawText = await res.text();
    if (!rawText) return null as T;

    const body = JSON.parse(rawText) as ApiResponse<T>;
    if (!body.success) {
      throw new ApiUnavailableError(body.error?.message ?? "API가 success:false를 반환했습니다.");
    }
    return body.data as T;
  } catch (err) {
    if (err instanceof ApiUnavailableError) throw err;
    const message = err instanceof Error ? err.message : "알 수 없는 네트워크 오류";
    throw new ApiUnavailableError(message);
  } finally {
    clearTimeout(timeout);
  }
}
