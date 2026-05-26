import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getLogoDataUrl(logoPath: string | null): Promise<string | null> {
  if (!logoPath) return null;
  try {
    const { data: blob, error } = await supabaseAdmin.storage
      .from("piloto-branding")
      .download(logoPath);
    if (error || !blob) return null;
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mime = logoPath.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}
