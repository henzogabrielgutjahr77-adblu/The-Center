type ConnectionState = "connecting" | "online" | "offline";

interface ConnectionStatusProps {
  label: string;
  state: ConnectionState;
  detail?: string | null;
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
  }
}

function getStateLabel(state: ConnectionState): string {
  switch (state) {
    case "online":
      return "Servidor conectado";
    case "offline":
      return "Servidor indisponível";
    case "connecting":
      return "Verificando conexão...";
  }
}

export function ConnectionStatus({
  label,
  state,
  detail,
  version,
}: ConnectionStatusProps) {
  return (
    <div className="status-card">
      <h2>{label}</h2>
      <div className="status-row">
        <div className={getDotClass(state)} />
        <span>{getStateLabel(state)}</span>
      </div>
      {detail && (
        <div className="status-row" style={{ marginTop: "0.5rem" }}>
          <span className="version-value">{detail}</span>
        </div>
      )}
      {version && (
        <div className="status-row" style={{ marginTop: "0.5rem" }}>
          <span className="version-value">{version}</span>
        </div>
      )}
    </div>
  );
}
