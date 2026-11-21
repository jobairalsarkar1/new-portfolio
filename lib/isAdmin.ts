import { auth } from "@/auth";

export async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.email && session.user.role === "ADMIN");
}
