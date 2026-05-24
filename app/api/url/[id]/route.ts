import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return Response.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Get the short_code before deletion (for cache cleanup)
    const { data: urlData } = await supabase
      .from("urls")
      .select("short_code")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    // Delete from database
    const { error } = await supabase
      .from("urls")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Clean up cache if URL was deleted
    if (urlData?.short_code) {
      try {
        await redis.del(urlData.short_code);
      } catch {
        // Cache cleanup failure is not critical
      }
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}