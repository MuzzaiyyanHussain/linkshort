import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard | LinkShort",
  description: "Manage your shortened URLs",
};

// Revalidate every 60 seconds for fresh data
export const revalidate = 60;

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Only select needed columns for performance
  const { data: urls, error } = await supabase
    .from("urls")
    .select("id, short_code, original_url, clicks, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100); // Limit to prevent loading too much data

  if (error) {
    console.error("Supabase error:", error);
  }

  return <DashboardClient initialUrls={urls || []} />;
}
