import { useCallback, useEffect, useState } from "react";
import type { HealthResponse } from "@the-center/api-types";
import { ApiError, TimeoutError, NetworkError, ValidationError } from "./lib/api/errors";
import { checkHealth } from "./lib/api/health";
import { getServerUrl } from "./lib/api/config";
import { useEvents } from "./hooks/useEvents";
import { computeUnreadCount } from "./lib/events";
import { Sidebar, type PageId } from "./components/Sidebar";
import { Header, type HeaderConnection } from "./components/Header";
import { Overview } from "./pages/Overview";
import { Activity } from "./pages/Activity";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import type { ServerState } from "./components/ServerStatusCard";

const initialState: HeaderConnection = {
  state: "connecting",
  detail: undefined,
};

function connectionFromError(err: unknown): HeaderConnection {
  if (err instanceof TimeoutError) {
    return { state: "error", detail: "Tempo de resposta excedido" };
  }
  if (err instanceof NetworkError) {
    return { state: "error", detail: "Falha de rede" };
  }
  if (err instanceof ValidationError) {
    return { state: "error", detail: "Resposta inválida do servidor" };
  }
  if (err instanceof ApiError) {
    return { state: "error", detail: `Erro HTTP ${err.status ?? ""}` };
  }
  return { state: "error", detail: "Erro desconhecido" };
}

function toServerState(connection: HeaderConnection): ServerState {
  switch (connection.state) {
    case "connected":
      return "online";
    case "connecting":
      return "connecting";
    default:
      return "offline";
  }
}

export default function App() {
  const [serverUrl] = useState(getServerUrl);
  const [serverHealth, setServerHealth] = useState<HealthResponse | null>(null);
  const [connection, setConnection] = useState<HeaderConnection>(initialState);
  const [page, setPage] = useState<PageId>("overview");
  const recentEvents = useEvents(5);

  const unreadCount = computeUnreadCount(recentEvents.items);

  const connect = useCallback(async () => {
    setConnection(initialState);
    setServerHealth(null);

    try {
      const health = await checkHealth(serverUrl);
      setServerHealth(health);
      setConnection({ state: "connected", detail: undefined });
    } catch (err) {
      setConnection(connectionFromError(err));
    }
  }, [serverUrl]);

  useEffect(() => {
    connect();
  }, [connect]);

  function renderPage() {
    switch (page) {
      case "overview":
        return (
          <Overview
            serverState={toServerState(connection)}
            serverHealth={serverHealth}
            onRetry={connect}
          />
        );
      case "activity":
        return <Activity />;
      case "servers":
        return <PlaceholderPage title="Servidores" />;
      case "settings":
        return <PlaceholderPage title="Configurações" />;
      default:
        return <PlaceholderPage title={page} />;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar active={page} onSelect={setPage} />

      <div className="app-main">
        <Header
          serverUrl={serverUrl}
          connection={connection}
          notification={{ unreadCount }}
        />
        {renderPage()}
      </div>
    </div>
  );
}
