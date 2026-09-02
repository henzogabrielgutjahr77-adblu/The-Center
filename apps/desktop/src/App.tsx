import { useState, useEffect, useCallback } from "react";
import { ApiClient } from "./api/client";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Header } from "./components/Header";

type ConnectionState = "connecting" | "online" | "offline" | "error";

interface ServerInfo {
  serverStatus: "ok" | "degraded" | "down" | null;
  serverVersion: string | null;
  connectionState: ConnectionState;
  errorMessage: string | null;
}

const DEFAULT_SERVER_URL = "http://localhost:3000";

function loadServerUrl(): string {
  try {
    const stored = localStorage.getItem("the-center-server-url");
    if (stored) return stored;
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_SERVER_URL;
}

function saveServerUrl(url: string): void {
  try {
    localStorage.setItem("the-center-server-url", url);
  } catch {
    // localStorage unavailable
  }
}

export default function App() {
  const [serverUrl, setServerUrl] = useState(loadServerUrl);
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    serverStatus: null,
    serverVersion: null,
    connectionState: "connecting",
    errorMessage: null,
  });

  const connect = useCallback(async (url: string) => {
    const client = new ApiClient(url);

    setServerInfo({
      serverStatus: null,
      serverVersion: null,
      connectionState: "connecting",
      errorMessage: null,
    });

    try {
      const [health, version] = await Promise.all([
        client.getHealth(),
        client.getVersion(),
      ]);

      setServerInfo({
        serverStatus: health.status,
        serverVersion: version.version,
        connectionState: "online",
        errorMessage: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown connection error";
      setServerInfo({
        serverStatus: null,
        serverVersion: null,
        connectionState: "offline",
        errorMessage: message,
      });
    }
  }, []);

  useEffect(() => {
    connect(serverUrl);
  }, []);

  const handleUrlChange = (newUrl: string) => {
    setServerUrl(newUrl);
    saveServerUrl(newUrl);
  };

  const handleRetry = () => {
    connect(serverUrl);
  };

  const handleUrlSubmit = () => {
    connect(serverUrl);
  };

  return (
    <div className="app">
      <Header />

      <div className="status-section">
        <ConnectionStatus
          label="Status do servidor"
          state={serverInfo.connectionState}
          value={serverInfo.serverStatus ?? undefined}
          version={serverInfo.serverVersion ?? undefined}
        />

        <ConnectionStatus
          label="Status do cliente"
          state="online"
          value="online"
        />
      </div>

      {serverInfo.errorMessage && (
        <div className="status-card">
          <div className="error-message">{serverInfo.errorMessage}</div>
          <button className="retry-button" onClick={handleRetry}>
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
          onChange={(e) => handleUrlChange(e.target.value)}
          onBlur={handleUrlSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleUrlSubmit();
          }}
          placeholder="http://localhost:3000"
        />
      </div>
    </div>
  );
}
