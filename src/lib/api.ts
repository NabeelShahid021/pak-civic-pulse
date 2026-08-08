import { toast } from "sonner";

export const API_BASE = "https://ai-smart-civic-services-sd5w.onrender.com";

export type Complaint = {
  complaint_id: number;
  citizen_id?: number | null;
  description: string;
  category: string;
  priority: string;
  location?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  date_submitted: string;
  status: string;
  assigned_department?: string | null;
  ai_summary?: string | null;
  ai_keywords?: string[];
  duplicate_of?: number | null;
  resolved_at?: string | null;
};

export type Stats = {
  total_complaints: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
  avg_resolution_time_hours?: number | null;
  duplicate_count: number;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/* ---------------- auth store ---------------- */

type Session = {
  citizenToken: string | null;
  citizenId: string | null;
  citizenCnic: string | null;
  citizenName: string | null;
  citizenPhone: string | null;
  adminToken: string | null;
};

const KEYS = {
  citizenToken: "citizen_token",
  citizenId: "citizen_id",
  citizenCnic: "citizen_cnic",
  citizenName: "citizen_name",
  citizenPhone: "citizen_phone",
  adminToken: "admin_token",
} as const;

const EMPTY: Session = {
  citizenToken: null,
  citizenId: null,
  citizenCnic: null,
  citizenName: null,
  citizenPhone: null,
  adminToken: null,
};

let session: Session = { ...EMPTY };
const listeners = new Set<() => void>();

function readStorage(): Session {
  if (typeof window === "undefined") return { ...EMPTY };
  return {
    citizenToken: localStorage.getItem(KEYS.citizenToken),
    citizenId: localStorage.getItem(KEYS.citizenId),
    citizenCnic: localStorage.getItem(KEYS.citizenCnic),
    citizenName: localStorage.getItem(KEYS.citizenName),
    citizenPhone: localStorage.getItem(KEYS.citizenPhone),
    adminToken: localStorage.getItem(KEYS.adminToken),
  };
}

function emit() {
  listeners.forEach((l) => l());
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => session,
  getServerSnapshot: () => EMPTY,
  hydrate() {
    session = readStorage();
    emit();
  },
  setCitizen(data: {
    token: string;
    citizenId: number | string;
    cnic: string;
    name?: string | null;
    phone?: string | null;
  }) {
    localStorage.setItem(KEYS.citizenToken, data.token);
    localStorage.setItem(KEYS.citizenId, String(data.citizenId));
    localStorage.setItem(KEYS.citizenCnic, data.cnic);
    if (data.name) localStorage.setItem(KEYS.citizenName, data.name);
    if (data.phone) localStorage.setItem(KEYS.citizenPhone, data.phone);
    session = readStorage();
    emit();
  },
  setAdmin(token: string) {
    localStorage.setItem(KEYS.adminToken, token);
    session = readStorage();
    emit();
  },
  logoutCitizen() {
    [
      KEYS.citizenToken,
      KEYS.citizenId,
      KEYS.citizenCnic,
      KEYS.citizenName,
      KEYS.citizenPhone,
    ].forEach((k) => localStorage.removeItem(k));
    session = readStorage();
    emit();
  },
  logoutAdmin() {
    localStorage.removeItem(KEYS.adminToken);
    session = readStorage();
    emit();
  },
};

/* --------------- unauthorized hook --------------- */

type UnauthorizedHandler = (kind: "citizen" | "admin") => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
export function setUnauthorizedHandler(fn: UnauthorizedHandler | null) {
  unauthorizedHandler = fn;
}

/* --------------- request core --------------- */

type Auth = "citizen" | "admin" | "none";

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: Auth; silent?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = "none", silent = false } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth === "citizen" && session.citizenToken)
    headers["Authorization"] = `Bearer ${session.citizenToken}`;
  if (auth === "admin" && session.adminToken)
    headers["Authorization"] = `Bearer ${session.adminToken}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    const err = new ApiError(0, "Network error — the service may be waking up. Please retry.");
    if (!silent) toast.error(err.message);
    throw err;
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail = (data as { detail?: unknown } | null)?.detail;
    let message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail
              .map(
                (d: { loc?: string[]; msg?: string }) =>
                  `${d.loc?.slice(-1)[0] ?? "field"}: ${d.msg ?? "invalid"}`,
              )
              .join(", ")
          : `Request failed (${res.status})`;
    if (res.status === 401) {
      message =
        auth === "admin"
          ? "Admin session expired. Please log in again."
          : "Please sign in to continue.";
      if (auth === "admin") authStore.logoutAdmin();
      if (auth === "citizen") authStore.logoutCitizen();
      if (auth !== "none") unauthorizedHandler?.(auth === "admin" ? "admin" : "citizen");
    }
    if (res.status === 409) message = "CNIC already registered. Please log in.";
    if (res.status === 500) message = "Server error. Please retry in a moment.";
    if (!silent) toast.error(message);
    throw new ApiError(res.status, message, detail);
  }

  return data as T;
}

export const api = {
  health: () => request<unknown>("/", { silent: true }),

  signup: (body: { cnic: string; password: string; name?: string; phone?: string }) =>
    request<{ token: string; citizen_id: number }>("/auth/signup", { method: "POST", body }),

  login: (body: { cnic: string; password: string }) =>
    request<{ token: string; citizen_id: number }>("/auth/login", { method: "POST", body }),

  submitComplaint: (body: {
    description: string;
    location?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    image_url?: string;
  }) => request<Complaint>("/submit-complaint", { method: "POST", body, auth: "citizen" }),

  myComplaints: () => request<Complaint[]>("/my-complaints", { auth: "citizen" }),

  track: (params: { complaint_id?: string; phone?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => !!v) as [string, string][],
    ).toString();
    return request<Complaint | Complaint[]>(`/track?${qs}`, { silent: true });
  },

  complaint: (id: number) => request<Complaint>(`/complaints/${id}`, { silent: true }),

  adminLogin: (password: string) =>
    request<{ token: string }>("/admin/login", { method: "POST", body: { password } }),

  complaints: (filters: Record<string, string | undefined>) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => !!v) as [string, string][],
    ).toString();
    return request<Complaint[]>(`/complaints${qs ? `?${qs}` : ""}`, { auth: "admin" });
  },

  updateComplaint: (id: number, body: { status?: string; assigned_department?: string }) =>
    request<Complaint>(`/complaints/${id}`, { method: "PATCH", body, auth: "admin" }),

  stats: () => request<Stats>("/stats", { auth: "admin" }),

  ask: (body: { question: string; phone?: string; complaint_id?: number }) =>
    request<{ question: string; answer: string }>("/ask", { method: "POST", body }),
};

/* --------------- helpers --------------- */

export function formatCnic(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function cnicDigits(value: string) {
  return value.replace(/\D/g, "");
}
