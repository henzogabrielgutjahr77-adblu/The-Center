import type { DigitalEvent } from "@the-center/api-types";
import { EventCard } from "./EventCard";

export interface EventListState {
  loading: boolean;
  error: string | null;
  items: DigitalEvent[];
}

interface EventListProps {
  state: EventListState;
  emptyMessage?: string;
  onRetry?: () => void;
}

export function EventList({ state, emptyMessage = "Nenhum evento até o momento.", onRetry }: EventListProps) {
  if (state.loading) {
    return <div className="list-message">Carregando eventos...</div>;
  }

  if (state.error) {
    return (
      <div className="list-message error">
        Erro ao carregar eventos: {state.error}
        {onRetry && (
          <button type="button" className="retry-button" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (state.items.length === 0) {
    return <div className="list-message">{emptyMessage}</div>;
  }

  return (
    <div className="event-list">
      {state.items.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
