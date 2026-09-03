import type { HealthResponse } from "@the-center/api-types";
import { ServerStatusCard, type ServerState } from "../components/ServerStatusCard";
import { EventList } from "../components/EventList";
import { useEvents } from "../hooks/useEvents";

interface OverviewProps {
  serverState: ServerState;
  serverHealth: HealthResponse | null;
  onRetry: () => void;
}

export function Overview({ serverState, serverHealth, onRetry }: OverviewProps) {
  const events = useEvents(10);

  return (
    <div className="page">
      <h1>Visão geral</h1>

      <ServerStatusCard
        state={serverState}
        health={serverHealth}
        onRetry={onRetry}
      />

      <section className="card-section">
        <h2>Eventos recentes</h2>
        <EventList
          state={events}
          onRetry={events.reload}
          emptyMessage="Nenhum evento recebido até o momento."
        />
      </section>
    </div>
  );
}
