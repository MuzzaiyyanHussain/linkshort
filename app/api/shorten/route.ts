import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { ratelimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const headersList = await headers();

    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";

    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return Response.json(
        {
          error: "Too many requests",
        },
        {
          status: 429,
        },
      );
    }

    const { userId } = await auth();

    const body = await req.json();

    const shortCode = nanoid(6);

    const { data, error } = await supabase
      .from("urls")
      .insert({
        user_id: userId,
        original_url: body.url,
        short_code: shortCode,
      })
      .select()
      .single();

    if (error) {
      return Response.json({
        error: error.message,
      });
    }

    return Response.json({
      success: true,
      data,
    });
  } catch (err) {
    console.log("CATCH ERROR:", err);

    return Response.json({
      error: "Server error",
    });
  }
}
