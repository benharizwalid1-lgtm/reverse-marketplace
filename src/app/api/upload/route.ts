import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file." }, { status: 400 });
  if (file.size > 4_000_000) return NextResponse.json({ error: "File too large (max 4MB)." }, { status: 400 });

  const type = file.type || "image/jpeg";
  if (!type.startsWith("image/")) return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`reverse/${session.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return NextResponse.json({ url: `data:${type};base64,${bytes.toString("base64")}` });
}
