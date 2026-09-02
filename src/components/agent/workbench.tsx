"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { InvestigationReport } from "@/components/agent/investigation-report";
import type { AgentEvent, Investigation } from "@/lib/ai/types";

const STARTERS = [
  "Why did checkout failures increase this morning?",
  "Compare Nigeria vs Ghana",
  "Find failed transactions",
  "Create incident",
  "Summarize open incidents",
];

export function AgentWorkbench({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [tools, setTools] = useState<string[]>([]);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const ran = useRef(false);

  async function investigate(q: string) {
    const text = q.trim();
    if (!text) return;
    setRunning(true);
    setError(null);
    setInvestigation(null);
    setTools([]);
    setStatus("Connecting to operations analyst…");
    const res = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text }),
    });
    if (!res.body) {
      setError("No stream from agent");
      setRunning(false);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";
      for (const chunk of chunks) {
        const line = chunk.replace(/^data:\s*/, "");
        if (!line) continue;
        try {
          const event = JSON.parse(line) as AgentEvent;
          if (event.type === "status") setStatus(event.message);
          if (event.type === "tool_start") {
            setTools((prev) => [...prev, event.name]);
            setStatus(`Calling ${event.name}`);
          }
          if (event.type === "result") setInvestigation(event.investigation);
          if (event.type === "error") setError(event.message);
        } catch {
          /* ignore malformed sse */
        }
      }
    }
    setRunning(false);
    setStatus(null);
  }

  useEffect(() => {
    if (initialQuery && !ran.current) {
      ran.current = true;
      setQuery(initialQuery);
      void investigate(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void investigate(query);
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Why did checkout failures increase this morning?"
          className="h-10 flex-1 rounded-md border border-qs-border bg-qs-bg px-3 text-[14px] outline-none focus:border-qs-accent/50"
        />
        <Button variant="primary" size="lg" type="submit" disabled={running}>
          Investigate
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-full border border-qs-border px-2.5 py-1 text-[11px] text-qs-muted hover:text-qs-text"
            onClick={() => {
              setQuery(s);
              void investigate(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {status ? (
        <div className="mt-6 text-[13px] text-qs-accent">
          {status}
          {tools.length ? (
            <span className="ml-2 text-qs-faint">{tools.join(" → ")}</span>
          ) : null}
        </div>
      ) : null}
      {error ? <div className="mt-6 text-[13px] text-qs-danger">{error}</div> : null}
      {investigation ? (
        <div className="mt-6 rounded-lg border border-qs-border bg-qs-surface p-5">
          <InvestigationReport investigation={investigation} />
        </div>
      ) : null}
    </div>
  );
}
