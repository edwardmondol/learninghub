import { NextResponse } from "next/server";
import { runIngestion } from "@/pipeline/ingest";

export const dynamic = "force-dynamic";

// Manual "Refresh now" endpoint hit by the dashboard button.
export async function POST() {
  try {
    const summary = await runIngestion();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Ingestion failed" },
      { status: 500 },
    );
  }
}
