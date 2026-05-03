import { redirect } from "next/navigation";

// Root page — redirect to login
// AuthProvider in the dashboard layout handles further routing
export default function Home() {
  redirect("/login");
}
