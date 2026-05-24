import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";

export default async function Page({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  const cachedUrl = await redis.get(shortCode);

  
  if (cachedUrl) {
    console.log("CACHE HIT");

    redirect(cachedUrl as string);
  }

  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("short_code", shortCode)
    .single();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Link not found
      </div>
    );
  }

  await redis.set(shortCode, data.original_url);

  await supabase
    .from("urls")
    .update({
      clicks: (data.clicks || 0) + 1,
    })
    .eq("id", data.id);

  redirect(data.original_url);
}