import { NextResponse } from "next/server";

/**
 * Health check so frontend can verify server is running
 */
export async function GET() {
  return NextResponse.json({ ok: true });
}

/**
 * Handles ONLY PDF upload
 * No preprocessing
 * No AI
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    console.log("✅ PDF received:", file.name, file.size);

    // TODO (later):
    // - Save to Supabase / disk
    // - Insert DB record

    return NextResponse.json({
      success: true,
      fileName: file.name,
      size: file.size,
    });
  } catch (err) {
    console.error("❌ Upload crashed:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
