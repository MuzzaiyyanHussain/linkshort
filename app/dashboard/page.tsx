import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardClient from "@/components/DashboardClient";

export const metadata = {
  title: "Dashboard | LinkShort",
  description: "Manage your shortened URLs",
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const { data: urls, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
  }

  return <DashboardClient initialUrls={urls || []} />;
}
