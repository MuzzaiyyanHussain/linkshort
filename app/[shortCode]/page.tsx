import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";

export const revalidate = false;
export const dynamicParams = true;

export default async function Page({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  // Validate short code format to prevent invalid lookups
  if (!shortCode || shortCode.length < 3 || shortCode.length > 10) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Invalid link
      </div>
    );
  }

  // Try cache first (24h TTL)
  const cachedUrl = await redis.get(shortCode);

  if (cachedUrl) {
    // Increment clicks asynchronously without blocking redirect
    incrementClicks(shortCode);
    redirect(cachedUrl as string);
  }

  // Fetch from database with timeout
  const { data, error } = await supabase
    .from("urls")
    .select("id, original_url, clicks")
    .eq("short_code", shortCode)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Link not found
      </div>
    );
  }

  // Cache for 24 hours
  await redis.setex(shortCode, 86400, data.original_url);

  // Increment clicks asynchronously
  incrementClicks(shortCode, data.id, data.clicks || 0);

  redirect(data.original_url);
}

async function incrementClicks(
  shortCode: string,
  id?: string,
  currentClicks?: number
) {
  if (!id || !shortCode) return;

  try {
    // Fire and forget - don't await
    // Queue the update to avoid blocking the redirect
    fetch(process.env.NEXT_PUBLIC_APP_URL + "/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, shortCode, currentClicks }),
    }).catch(() => {
      // Silent fail - click tracking shouldn't block redirect
    });
  } catch {
    // Ignore errors
  }
}