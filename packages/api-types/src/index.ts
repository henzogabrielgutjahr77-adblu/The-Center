export type EventSource =
  | "gmail"
  | "instagram"
  | "discord"
  | "youtube"
  | "github"
  | "server"
  | "system";

export type EventType =
  | "message"
  | "notification"
  | "alert"
  | "update"
  | "error"
  | "info";

export type Importance = "low" | "medium" | "high" | "critical";

export interface DigitalEvent {
  id: string;
  source: EventSource;
  account: string;
  type: EventType;
  author: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  content: {
    title: string;
    body: string;
    url?: string;
  };
  metadata: Record<string, unknown>;
  importance: Importance;
  read: boolean;
}

export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  timestamp: string;
}

export interface VersionResponse {
  version: string;
  name: string;
}
