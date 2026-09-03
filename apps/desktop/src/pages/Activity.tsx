import { EventList } from "../components/EventList";
import { useEvents } from "../hooks/useEvents";

export function Activity() {
  const events = useEvents(50);

  return (
    <div className="page">
      <h1>Atividade</h1>
      <EventList
        state={events}
        onRetry={events.reload}
        emptyMessage="Ainda não há eventos de atividade."
      />
    </div>
  );
}
