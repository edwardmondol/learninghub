import { NextResponse } from "next/server";
import { runIngestion } from "@/pipeline/ingest";

export const dynamic = "force-dynamic";

// Daily cron endpoint (Vercel Cron). Protected by CRON_SECRET.
// Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

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
