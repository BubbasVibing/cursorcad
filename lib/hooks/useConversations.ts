"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type {
  DesignSession,
  ConversationMessage,
  SessionListItem,
} from "@/lib/types";
import {
  loadSessions,
  saveSession,
  deleteSession as deleteLocalSession,
  generateSessionId,
} from "@/lib/session-store";

interface FullConversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  jscadCode: string | null;
  lastPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useConversations() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const authLoading = status === "loading";
  const [conversations, setConversations] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrated, setMigrated] = useState(false);

  // Convert localStorage DesignSession[] to SessionListItem[]
  const localToListItems = useCallback(
    (sessions: DesignSession[]): SessionListItem[] =>
      sessions.map((s) => ({
        id: s.id,
        title: s.title,
        lastMessage:
          s.messages.length > 0
            ? s.messages[s.messages.length - 1].content.slice(0, 100)
            : null,
        updatedAt: s.updatedAt,
      })),
    []
  );

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      const local = loadSessions();
      setConversations(localToListItems(local));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(
          data.conversations.map(
            (c: {
              id: string;
              title: string;
              lastMessage: string | null;
              updatedAt: string;
            }) => ({
              id: c.id,
              title: c.title,
              lastMessage: c.lastMessage,
              updatedAt: c.updatedAt,
            })
          )
        );
      }
    } catch (err) {
      console.error("[useConversations] Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, localToListItems]);

  // Initial fetch
  useEffect(() => {
    if (!authLoading) fetchConversations();
  }, [authLoading, fetchConversations]);

  // One-time migration of localStorage sessions to DB
  useEffect(() => {
    if (!isAuthenticated || migrated || authLoading) return;

    const localSessions = loadSessions();
    if (localSessions.length === 0) {
      setMigrated(true);
      return;
    }

    const MIGRATION_KEY = `cadoncrack-migrated-${session?.user?.id}`;
    if (localStorage.getItem(MIGRATION_KEY)) {
      setMigrated(true);
      return;
    }

    fetch("/api/conversations/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions: localSessions }),
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem(MIGRATION_KEY, "true");
          fetchConversations();
        }
      })
      .catch(console.error)
      .finally(() => setMigrated(true));
  }, [isAuthenticated, migrated, authLoading, session?.user?.id, fetchConversations]);

  // Create a new conversation
  const createConversation = useCallback(
    async (
      data: Partial<{
        title: string;
        messages: ConversationMessage[];
        jscadCode: string | null;
        lastPrompt: string | null;
      }>
    ): Promise<string> => {
      if (!isAuthenticated) {
        const id = generateSessionId();
        const now = Date.now();
        const localSession: DesignSession = {
          id,
          title: data.title || "Untitled Design",
          messages: data.messages || [],
          jscadCode: data.jscadCode ?? null,
          lastPrompt: data.lastPrompt ?? null,
          createdAt: now,
          updatedAt: now,
        };
        saveSession(localSession);
        setConversations(localToListItems(loadSessions()));
        return id;
      }

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      await fetchConversations();
      return result.id;
    },
    [isAuthenticated, fetchConversations, localToListItems]
  );

  // Load a full conversation
  const loadConversation = useCallback(
    async (id: string): Promise<FullConversation | DesignSession | null> => {
      if (!isAuthenticated) {
        const sessions = loadSessions();
        return sessions.find((s) => s.id === id) ?? null;
      }

      try {
        const res = await fetch(`/api/conversations/${id}`);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    [isAuthenticated]
  );

  // Update a conversation
  const updateConversation = useCallback(
    async (
      id: string,
      data: Partial<{
        title: string;
        messages: ConversationMessage[];
        jscadCode: string | null;
        lastPrompt: string | null;
      }>
    ): Promise<void> => {
      if (!isAuthenticated) {
        const sessions = loadSessions();
        const existing = sessions.find((s) => s.id === id);
        if (existing) {
          const updated: DesignSession = {
            ...existing,
            ...data,
            updatedAt: Date.now(),
          };
          saveSession(updated);
          setConversations(localToListItems(loadSessions()));
        }
        return;
      }

      try {
        await fetch(`/api/conversations/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error("[useConversations] Failed to update:", err);
      }
    },
    [isAuthenticated, localToListItems]
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      if (!isAuthenticated) {
        deleteLocalSession(id);
        setConversations(localToListItems(loadSessions()));
        return;
      }

      try {
        await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        setConversations((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error("[useConversations] Failed to delete:", err);
      }
    },
    [isAuthenticated, localToListItems]
  );

  return {
    conversations,
    loading,
    isAuthenticated,
    authLoading,
    fetchConversations,
    createConversation,
    loadConversation,
    updateConversation,
    deleteConversation,
  };
}
