import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { ratelimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";

    // Rate limit check (fast, cached in Upstash)
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return Response.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();

    // Validate URL before processing
    if (!body.url || typeof body.url !== "string") {
      return Response.json(
        { error: "Invalid URL" },
        { status: 400 }
      );
    }

    if (!isValidUrl(body.url)) {
      return Response.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Get user (can be null for public usage)
    const { userId } = await auth();

    // Generate short code
    const shortCode = nanoid(6);

    // Insert into database
    const { data, error } = await supabase
      .from("urls")
      .insert({
        user_id: userId,
        original_url: body.url,
        short_code: shortCode,
      })
      .select("id, short_code, original_url, clicks, created_at")
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-cache" } }
    );
  } catch (err) {
    console.error("Shorten error:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
