type ConnectionState = "connecting" | "online" | "offline" | "error";

interface ConnectionStatusProps {
  label: string;
  state: ConnectionState;
  value?: string;
  version?: string;
}

function getDotClass(state: ConnectionState): string {
  switch (state) {
    case "online":
      return "status-dot online";
    case "offline":
      return "status-dot offline";
    case "connecting":
      return "status-dot connecting";
    case "error":
      return "status-dot error";
  }
}

function getStateLabel(state: ConnectionState, value?: string): string {
  if (value) return value;
  switch (state) {
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    case "connecting":
      return "Connecting...";
    case "error":
      return "Error";
  }
}

export function ConnectionStatus({
  label,
  state,
  value,
  version,
}: ConnectionStatusProps) {
  return (
    <div className="status-card">
      <h2>{label}</h2>
      <div className="status-row">
        <div className={getDotClass(state)} />
        <span>{getStateLabel(state, value)}</span>
      </div>
      {version && (
        <div className="status-row" style={{ marginTop: "0.5rem" }}>
          <span className="version-value">{version}</span>
        </div>
      )}
    </div>
  );
}
