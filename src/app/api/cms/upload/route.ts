import { NextRequest, NextResponse } from "next/server";
import { assertStaff, assertAdmin } from "@/lib/auth/roles";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  // Former Supabase bucket name — now the R2 key prefix, so client calls are unchanged.
  const prefix = (formData.get("bucket") as string) || "gallery";

  // Gallery uploads → staff. Anything else (experience-images, etc) → admin only.
  const auth = prefix === "gallery" ? await assertStaff() : await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const url = await uploadToR2(key, bytes, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
