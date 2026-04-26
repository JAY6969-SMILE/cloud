export const BASE = "http://localhost:8080/api";

export const getToken = () => localStorage.getItem("jwt");
export const getRole = () => localStorage.getItem("role");
export const setToken = (token) => localStorage.setItem("jwt", token);
export const setRole = (role) => localStorage.setItem("role", role);
export const clearSession = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("role");
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiFetch(path, options = {}) {
  const opts = { ...options };
  opts.headers = { ...(options.headers || {}) };

  const url = BASE + path;

  try {
    const res = await fetch(url, opts);
    if (res.status === 401) {
      location.href = "auth.html";
      return;
    }

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const msg =
        data && typeof data === "object" && data.error
          ? data.error
          : `Request failed (${res.status})`;
      console.error("API error response", {
        url,
        method: opts.method || "GET",
        status: res.status,
        statusText: res.statusText,
        response: data
      });
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    console.error("API fetch/network error", {
      url,
      method: opts.method || "GET",
      headers: opts.headers,
      message: err?.message,
      error: err
    });
    throw err;
  }
}

export function requireEmployer() {
  if (!getToken() || getRole() !== "EMPLOYER") {
    location.href = "auth.html";
    return false;
  }
  return true;
}
