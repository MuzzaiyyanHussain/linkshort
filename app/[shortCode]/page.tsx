import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  console.log("SHORT CODE:", shortCode);

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

  await supabase
    .from("urls")
    .update({
      clicks: (data.clicks || 0) + 1,
    })
    .eq("id", data.id);

  redirect(data.original_url);
}