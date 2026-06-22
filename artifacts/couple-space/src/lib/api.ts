import { getCoupleCode } from "./coupleCode";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("X-Couple-Code", getCoupleCode());
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
