export type ConnectionState =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

export interface HeaderConnection {
  state: ConnectionState;
  detail?: string;
}

export interface HeaderNotification {
  unreadCount: number;
}

export interface HeaderProps {
  serverUrl: string;
  connection: HeaderConnection;
  notification: HeaderNotification;
}

const STATE_LABEL: Record<ConnectionState, string> = {
  connected: "Conectado",
  connecting: "Conectando...",
  disconnected: "Desconectado",
  error: "Erro",
};

/**
 * Header puramente apresentacional.
 * Não realiza chamadas HTTP nem contém lógica de API; apenas exibe o estado
 * que pertence ao App/Dashboard.
 */
export function Header({ serverUrl, connection, notification }: HeaderProps) {
  return (
    <header className="header">
      <h1>THE CENTER</h1>

      <div className="header-meta">
        <div className="header-status">
          <span className={`status-dot ${connection.state}`} />
          <span>{STATE_LABEL[connection.state]}</span>
        </div>

        {notification.unreadCount > 0 && (
          <span className="unread-badge">{notification.unreadCount} não lidos</span>
        )}

        <span className="header-url">{serverUrl}</span>
      </div>
    </header>
  );
}
