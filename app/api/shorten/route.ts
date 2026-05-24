import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    console.log("API HIT");

    const { userId } = await auth();

    console.log("USER ID:", userId);

    const body = await req.json();

    console.log("BODY:", body);

    const shortCode = nanoid(6);

    console.log("SHORT CODE:", shortCode);

    const { data, error } = await supabase
      .from("urls")
      .insert({
        user_id: userId,
        original_url: body.url,
        short_code: shortCode,
      })
      .select()
      .single();

    console.log("DATA:", data);
    console.log("ERROR:", error);

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