import { base44 } from "@/api/base44Client";

export async function checkIsAdmin() {
  try {
    const user = await base44.auth.me();
    return user?.role === "admin";
  } catch {
    return false;
  }
}