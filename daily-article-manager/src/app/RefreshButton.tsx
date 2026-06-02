"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Refresh failed");
      } else {
        const s = data.summary;
        setMsg(`+${s.inserted} new · ${s.afterDedupe} unique · ${s.totalFetched} fetched`);
        router.refresh();
      }
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-sm text-slate-500">{msg}</span>}
      <button
        onClick={refresh}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Refreshing…" : "Refresh now"}
      </button>
    </div>
  );
}
