import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return {
      session: null,
      error: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
