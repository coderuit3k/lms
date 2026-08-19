import { eq } from "drizzle-orm";
import { Mux } from "@mux/mux-node";
import { db } from "@/config/db";
import { lessonsTable } from "@/config/schema";

export async function POST(req: Request) {
  const body = await req.text();

  const mux = new Mux();
  let event;
  try {
    event = await mux.webhooks.unwrap(body, req.headers, process.env.MUX_WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "video.asset.ready") {
    const lessonId = Number(event.data.passthrough);
    const playbackId = event.data.playback_ids?.[0]?.id;

    if (lessonId && playbackId) {
      await db.update(lessonsTable).set({ videoAssetId: playbackId, youtubeUrl: null }).where(eq(lessonsTable.id, lessonId));
    }
  }

  return new Response("ok", { status: 200 });
}
