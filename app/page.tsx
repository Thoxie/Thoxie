// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCaseStore } from "@/lib/caseStore";
import { CA_COUNTIES } from "@/lib/caCounties";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "thoxie_familylaw_chat_v1";

function formatCurrencyUSD(n: number) {
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function HomePage() {
  const caseStore = useCaseStore();

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Intake state
  const [county, setCounty] = useState(caseStore.county || "San Mateo");
  const [caseStage, setCaseStage] = useState(caseStore.caseStage || "Early / just starting");
  const [children, setChildren] = useState(caseStore.children ?? "No");
  const [marriageYears, setMarriageYears] = useState(caseStore.marriageYears ?? "");
  const [petitioner, setPetitioner] = useState(caseStore.petitioner ?? "Not sure");
  const [income, setIncome] = useState(caseStore.income ?? "");
  const [assetsApprox, setAssetsApprox] = useState(caseStore.assetsApprox ?? "");
  const [priority, setPriority] = useState(caseStore.priority ?? "Protect assets / fair division");
  const [notes, setNotes] = useState(caseStore.notes ?? "");

  const counties = useMemo(() => CA_COUNTIES, []);

  useEffect(() => {
    // Load chat history
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Persist chat history
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    // persist intake to store
    caseStore.setCounty(county);
    caseStore.setCaseStage(caseStage);
    caseStore.setChildren(children);
    caseStore.setMarriageYears(marriageYears);
    caseStore.setPetitioner(petitioner);
    caseStore.setIncome(income);
    caseStore.setAssetsApprox(assetsApprox);
    caseStore.setPriority(priority);
    caseStore.setNotes(notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [county, caseStage, children, marriageYears, petitioner, income, assetsApprox, priority, notes]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setApiError(null);
    setIsSending(true);

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];

