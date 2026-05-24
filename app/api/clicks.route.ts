import { supabase } from "@/lib/supabase";

// Batch process click updates to reduce database load
const clickQueue = new Map<string, { id: string; clicks: number }>();
let flushTimeout: NodeJS.Timeout;

function scheduleFlush() {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushClicks, 5000); // Batch every 5 seconds
}

async function flushClicks() {
  if (clickQueue.size === 0) return;

  const updates = Array.from(clickQueue.values());
  clickQueue.clear();

  try {
    // Batch update all clicks
    await Promise.all(
      updates.map(async ({ id, clicks }) => {
        try {
          await supabase
            .from("urls")
            .update({ clicks })
            .eq("id", id);
        } catch {
          // Silent fail - don't disrupt service
        }
      })
    );
  } catch {
    // Silently fail - analytics are not critical
  }
}

export async function POST(req: Request) {
  try {
    const { id, shortCode, currentClicks } = await req.json();

    if (!id || !shortCode) {
      return Response.json({ success: false }, { status: 400 });
    }

    // Queue the click update
    clickQueue.set(id, {
      id,
      clicks: (currentClicks || 0) + 1,
    });

    scheduleFlush();

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false }, { status: 500 });
  }
}
