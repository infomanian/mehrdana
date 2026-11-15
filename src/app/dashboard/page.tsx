import { redirect } from "next/navigation";

/**
 * The architecture document lists both /dashboard and /profile.
 * They are the same place, so /dashboard simply forwards to the profile page.
 */
export default function DashboardPage() {
  redirect("/profile");
}
