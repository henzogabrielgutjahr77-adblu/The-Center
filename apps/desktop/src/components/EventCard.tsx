import type { DigitalEvent } from "@the-center/api-types";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

const IMPORTANCE_LABEL: Record<string, string> = {
  low: "baixa",
  medium: "média",
  high: "alta",
  critical: "crítica",
};

export function EventCard({ event }: { event: DigitalEvent }) {
  const { author, content, importance, read } = event;
  const title = content.title ?? author.name ?? event.source;

  return (
    <article className={`event-card${read ? " read" : " unread"}`}>
      <div className="event-card-header">
        <span className="event-source">{event.source}</span>
        {!read && <span className="event-badge">não lido</span>}
        <span className={`event-importance importance-${importance}`}>
          {IMPORTANCE_LABEL[importance] ?? importance}
        </span>
        <span className="event-time">{formatTime(event.timestamp)}</span>
      </div>

      <h3 className="event-title">{title}</h3>

      <p className="event-body">{content.body}</p>

      <div className="event-footer">
        <span className="event-author">
          {author.name}
          {author.avatar ? ` · ${author.avatar}` : ""}
        </span>
        <span className="event-account">{event.account}</span>
        {content.url && (
          <a
            className="event-url"
            href={content.url}
            target="_blank"
            rel="noreferrer"
          >
            abrir
          </a>
        )}
      </div>
    </article>
  );
}
