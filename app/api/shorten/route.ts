import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { userId } = await auth();
  const body = await req.json();
  const shortCode = nanoid(6);

  const { data, error } = await supabase
    .from("urls")
    .insert({ userId: userId, original_url: body.url, shortCode: shortCode })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message });
  }

  return Response.json({ data });
}
