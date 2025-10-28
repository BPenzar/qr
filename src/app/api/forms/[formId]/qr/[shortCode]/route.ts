import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";

type RouteParams = Promise<{ formId: string; shortCode: string }>;

export async function GET(_request: Request, { params }: { params: RouteParams }) {
  const { formId, shortCode } = await params;
  const supabase = await getServerSupabaseClient();
  const { data: qrCode, error } = await supabase
    .from("form_qr_codes")
    .select("destination_url, label, form_id")
    .eq("form_id", formId)
    .eq("short_code", shortCode)
    .single();

  if (error || !qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  const png = await QRCode.toBuffer(qrCode.destination_url, {
    type: "png",
    margin: 1,
    scale: 10,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return new NextResponse(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${qrCode.label.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}_${shortCode}.png"`,
    },
  });
}
