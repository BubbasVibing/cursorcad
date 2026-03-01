import type { DesignSession } from "@/lib/types";

const STORAGE_KEY = "cadoncrack-sessions";
const MAX_SESSIONS = 50;

export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function loadSessions(): DesignSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: DesignSession[] = JSON.parse(raw);
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveSession(session: DesignSession): void {
  if (typeof window === "undefined") return;
  try {
    let sessions = loadSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    // Enforce limit — drop oldest
    if (sessions.length > MAX_SESSIONS) {
      sessions = sessions
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_SESSIONS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    console.warn("[session-store] Failed to save session");
  }
}

export function deleteSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const sessions = loadSessions().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    console.warn("[session-store] Failed to delete session");
  }
}
