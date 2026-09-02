import { useState, useEffect, useCallback } from "react";
import type { HealthResponse } from "@the-center/api-types";
import { ApiError, TimeoutError, NetworkError, ValidationError } from "./lib/api/errors";
import { checkHealth } from "./lib/api/health";
import { getServerUrl } from "./lib/api/config";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Header } from "./components/Header";

type ConnectionState = "connecting" | "online" | "offline";

interface ConnectionStateInfo {
  state: ConnectionState;
  detail: string | null;
}

const initialState: ConnectionStateInfo = {
  state: "connecting",
  detail: null,
};

export default function App() {
  const [serverUrl] = useState(getServerUrl);
  const [serverHealth, setServerHealth] = useState<HealthResponse | null>(null);
  const [connection, setConnection] = useState<ConnectionStateInfo>(initialState);

  const connect = useCallback(async () => {
    setConnection(initialState);
    setServerHealth(null);

    try {
      const health = await checkHealth(serverUrl);
      setServerHealth(health);
      setConnection({ state: "online", detail: null });
    } catch (err) {
      if (err instanceof TimeoutError) {
        setConnection({ state: "offline", detail: "Tempo de resposta excedido" });
      } else if (err instanceof NetworkError) {
        setConnection({ state: "offline", detail: "Falha de rede" });
      } else if (err instanceof ValidationError) {
        setConnection({ state: "offline", detail: "Resposta inválida do servidor" });
      } else if (err instanceof ApiError) {
        setConnection({ state: "offline", detail: `Erro HTTP ${err.status ?? ""}` });
      } else {
        setConnection({ state: "offline", detail: "Erro desconhecido" });
      }
    }
  }, [serverUrl]);

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="app">
      <Header />

      <div className="status-section">
        <ConnectionStatus
          label="Status do servidor"
          state={connection.state}
          detail={connection.detail}
          version={serverHealth?.timestamp}
        />

        <ConnectionStatus label="Status do cliente" state="online" />
      </div>

      {connection.state === "offline" && (
        <div className="status-card">
          <div className="error-message">
            Servidor indisponível
            {connection.detail ? ` (${connection.detail})` : ""}
          </div>
          <button className="retry-button" onClick={connect}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="config-section">
        <label htmlFor="server-url">URL do servidor</label>
        <input
          id="server-url"
          className="config-input"
          type="text"
          value={serverUrl}
          readOnly
        />
      </div>
    </div>
  );
}
