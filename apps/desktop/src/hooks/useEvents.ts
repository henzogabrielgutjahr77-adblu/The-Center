import { useCallback, useEffect, useState } from "react";
import { fetchEvents } from "../lib/api/events";
import type { EventListState } from "../components/EventList";

export function useEvents(limit?: number) {
  const [state, setState] = useState<EventListState>({
    loading: true,
    error: null,
    items: [],
  });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchEvents(undefined, limit !== undefined ? { limit } : undefined)
      .then((res) => {
        if (!cancelled) {
          setState({ loading: false, error: null, items: res.items });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: err instanceof Error ? err.message : String(err),
            items: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [limit, tick]);

  return { ...state, reload };
}
