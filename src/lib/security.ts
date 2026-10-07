/**
 * Frontend Security Layer: CSRF / XSRF Token Management & Secure HTTP Transport
 *
 * Implements:
 * 1. Double-Submit Cookie / XSRF Token handshake (X-XSRF-TOKEN & X-CSRF-Token headers)
 * 2. Defense-in-depth headers (X-Requested-With: XMLHttpRequest)
 * 3. Secure fetch interceptor with credentials & header injection
 */

export const CSRF_COOKIE_NAME = "XSRF-TOKEN";
export const CSRF_ALT_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
export const CSRF_ALT_HEADER_NAME = "X-CSRF-Token";
export const REQUESTED_WITH_HEADER = "X-Requested-With";

/**
 * Safely retrieves a cookie value by name from document.cookie in the browser.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * Sets a cookie with security best practices (SameSite=Strict, Path=/).
 */
export function setCookie(name: string, value: string, maxAgeSeconds: number = 86400): void {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Strict${secureFlag}`;
}

/**
 * Generates a cryptographically strong UUID / random token for CSRF protection.
 */
export function generateRandomToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  const array = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Retrieves the current CSRF/XSRF token.
 * If the server has already set an XSRF-TOKEN cookie, it uses that.
 * Otherwise, generates a client-side session CSRF token, synchronizes it to cookie & sessionStorage.
 */
export function getOrCreateCsrfToken(): string {
  if (typeof window === "undefined") {
    return "ssr-csrf-token";
  }

  // 1. Check if backend set an XSRF-TOKEN cookie
  const cookieToken = getCookie(CSRF_COOKIE_NAME) || getCookie(CSRF_ALT_COOKIE_NAME);
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Check if already stored in sessionStorage
  try {
    const sessionToken = sessionStorage.getItem("xsrf_token");
    if (sessionToken) {
      setCookie(CSRF_COOKIE_NAME, sessionToken);
      return sessionToken;
    }
  } catch {
    // sessionStorage not available (private mode or iframe)
  }

  // 3. Generate a fresh client-side token and synchronize
  const freshToken = generateRandomToken();
  setCookie(CSRF_COOKIE_NAME, freshToken);
  try {
    sessionStorage.setItem("xsrf_token", freshToken);
  } catch {
    // ignore
  }

  return freshToken;
}

/**
 * Builds the security headers to attach to an outgoing HTTP request.
 * Automatically injects X-XSRF-TOKEN, X-CSRF-Token, and X-Requested-With on mutation requests.
 */
export function buildSecurityHeaders(
  method: string = "GET",
  customHeaders?: HeadersInit
): Headers {
  const headers = new Headers(customHeaders || {});
  const upperMethod = method.toUpperCase();
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(upperMethod);

  // Set standard API headers if not already set
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (isMutation) {
    const token = getOrCreateCsrfToken();

    // 1. Primary XSRF header (Angular, Axios, Spring, FastAPI standard)
    if (!headers.has(CSRF_HEADER_NAME)) {
      headers.set(CSRF_HEADER_NAME, token);
    }

    // 2. Alternative CSRF header (Express, Rails, Django standard)
    if (!headers.has(CSRF_ALT_HEADER_NAME)) {
      headers.set(CSRF_ALT_HEADER_NAME, token);
    }

    // 3. X-Requested-With header to block simple cross-origin HTML form POSTs
    if (!headers.has(REQUESTED_WITH_HEADER)) {
      headers.set(REQUESTED_WITH_HEADER, "XMLHttpRequest");
    }

    // 4. Unique Idempotency / Request ID to track mutations and prevent replays
    if (!headers.has("X-Request-ID")) {
      headers.set("X-Request-ID", generateRandomToken());
    }
  }

  return headers;
}

/**
 * Secure HTTP Client Fetch Wrapper.
 * Intercepts requests to automatically attach CSRF/XSRF tokens, defense headers,
 * and standard error handling.
 */
export async function secureFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = init?.method || "GET";
  const secureHeaders = buildSecurityHeaders(method, init?.headers);

  const secureInit: RequestInit = {
    ...init,
    method,
    headers: secureHeaders,
    credentials: init?.credentials || "same-origin",
  };

  return fetch(input, secureInit);
}

/**
 * Validates that a URL uses safe protocols (http: or https:).
 * Explicitly rejects dangerous pseudoprotocols like javascript:, data:, vbscript:.
 */
export function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    // Relative safe URLs like /properties/123
    return trimmed.startsWith("/");
  }
}

/**
 * Sanitizes an external URL to prevent XSS via javascript: or data: injection.
 * If the URL is unsafe, returns fallback ("#").
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = "#"): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (isValidHttpUrl(trimmed)) {
    return trimmed;
  }
  return fallback;
}

