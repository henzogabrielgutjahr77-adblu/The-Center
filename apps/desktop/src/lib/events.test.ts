import { describe, it, expect } from "vitest";
import type { DigitalEvent } from "@the-center/api-types";
import { computeUnreadCount } from "./events";

function event(read: boolean, overrides: Partial<DigitalEvent> = {}): DigitalEvent {
  return {
    id: crypto.randomUUID(),
    source: "system",
    account: "test",
    type: "info",
    author: { name: "The Center", avatar: null },
    timestamp: "2026-09-02T12:00:00Z",
    content: { body: "x" },
    metadata: {},
    importance: "medium",
    read,
    ...overrides,
  };
}

describe("computeUnreadCount", () => {
  it("returns 0 for an empty list", () => {
    expect(computeUnreadCount([])).toBe(0);
  });

  it("counts only events not marked as read", () => {
    const events = [event(false), event(true), event(false), event(false)];
    expect(computeUnreadCount(events)).toBe(3);
  });

  it("returns 0 when all events are read", () => {
    const events = [event(true), event(true)];
    expect(computeUnreadCount(events)).toBe(0);
  });

  it("returns 1 for a single unread event", () => {
    expect(computeUnreadCount([event(false)])).toBe(1);
  });

  it("ignores source/type/importance, counting only by read", () => {
    const events = [
      event(false, { source: "github", type: "update", importance: "high", read: false }),
      event(true, { source: "gmail", type: "message", importance: "low" }),
    ];
    expect(computeUnreadCount(events)).toBe(1);
  });
});
