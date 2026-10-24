import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function POST(req: Request) {
  const { idToken } = await req.json();
  if (!idToken)
    return Response.json({ error: "Missing idToken" }, { status: 400 });

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    (await cookies()).set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_MS / 1000,
      path: "/",
    });

    return Response.json({ status: "ok" });
  } catch {
    return Response.json(
      { error: "Failed to create session" },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  (await cookies()).delete("session");
  return Response.json({ status: "ok" });
}
