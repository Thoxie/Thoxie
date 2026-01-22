// PATH: app/page.tsx
"use client";

import { useState } from "react";
import { CASE_TYPES, CASE_TYPE_LABELS, CaseTypeId } from "@/lib/caseTypes";

export default function HomePage() {
  const [caseType, setCaseType] = useState<CaseTypeId>("FAMILY_LAW");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!message.trim()) return;
    setLoading(true);
    setReply("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: { caseType },
      }),
    });

    const data = await res.json();
    setReply(data.reply || "");
    setLoading(false);
  }

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>THOXIE</h1>

      {/* CASE TYPE SELECTOR */}
      <label>
        Case Type:&nbsp;
        <select
          value={caseType}
          onChange={(e) => setCaseType(e.target.value as CaseTypeId)}
        >
          {CASE_TYPES.map((ct) => (
            <option key={ct} value={ct}>
              {CASE_TYPE_LABELS[ct]}
            </option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: 16 }}>
        <textarea
          rows={6}
          style={{ width: "100%" }}
          placeholder="Describe your situation..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button onClick={send} disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "Thinking…" : "Send"}
      </button>

      {reply && (
        <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{reply}</pre>
      )}
    </main>
  );
}
