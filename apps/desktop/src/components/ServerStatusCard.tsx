import type { HealthResponse } from "@the-center/api-types";

export type ServerState = "connecting" | "online" | "offline";

interface ServerStatusCardProps {
  state: ServerState;
  health: HealthResponse | null;
  detail?: string | null;
  onRetry?: () => void;
}

function stateLabel(state: ServerState): string {
  switch (state) {
    case "online":
      return "Conectado";
    case "offline":
      return "Indisponível";
    case "connecting":
      return "Verificando conexão...";
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function ServerStatusCard({
  state,
  health,
  detail,
  onRetry,
}: ServerStatusCardProps) {
  return (
    <div className="status-card">
      <h2>Estado do servidor</h2>
      <div className="status-row">
        <span className={`status-dot ${state}`} />
        <span>{stateLabel(state)}</span>
      </div>

      {health && (
        <div className="server-status-details">
          <div className="status-row">
            <span className="server-status-label">status</span>
            <span className="version-value">{health.status}</span>
          </div>
          {health.timestamp && (
            <div className="status-row">
              <span className="server-status-label">timestamp</span>
              <span className="version-value">{formatTimestamp(health.timestamp)}</span>
            </div>
          )}
          {health.uptime !== undefined && (
            <div className="status-row">
              <span className="server-status-label">uptime</span>
              <span className="version-value">{formatUptime(health.uptime)}</span>
            </div>
          )}
        </div>
      )}

      {state === "offline" && (
        <div className="status-alert">
          Servidor indisponível{detail ? ` (${detail})` : ""}.
        </div>
      )}

      {onRetry && state === "offline" && (
        <button type="button" className="retry-button" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
