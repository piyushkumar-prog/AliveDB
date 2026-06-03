// ============================================================
// AliveDB — Shared TypeScript Types
// ============================================================

export type ProjectStatus = "active" | "warning" | "down" | "pending" | "paused";
export type PingInterval = "6h" | "12h" | "24h" | "custom";
export type HttpMethod = "GET" | "HEAD";

export interface Project {
  id: string;
  name: string;
  url: string;
  healthEndpoint: string;
  pingInterval: string;
  customCron: string | null;
  method: string;
  supabaseAnonKey: string | null;
  isPaused: boolean;
  status: string;
  lastPingedAt: Date | string | null;
  nextPingAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  logs?: PingLog[];
}

export interface PingLog {
  id: string;
  projectId: string;
  statusCode: number | null;
  responseTime: number | null;
  success: boolean;
  error: string | null;
  createdAt: Date | string;
}

export interface PingResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

export interface DashboardStats {
  total: number;
  active: number;
  warning: number;
  down: number;
  paused: number;
  uptimePercent: number;
}

export interface ProjectWithLastLog extends Project {
  lastLog?: PingLog | null;
}

// API request/response shapes
export interface CreateProjectInput {
  name: string;
  url: string;
  healthEndpoint?: string;
  pingInterval?: string;
  customCron?: string;
  method?: string;
  supabaseAnonKey?: string;
}

export interface UpdateProjectInput {
  name?: string;
  url?: string;
  healthEndpoint?: string;
  pingInterval?: string;
  customCron?: string;
  method?: string;
  supabaseAnonKey?: string | null;
  isPaused?: boolean;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
