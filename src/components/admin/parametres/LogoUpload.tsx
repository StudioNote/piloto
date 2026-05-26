"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadLogo, supprimerLogo } from "@/app/admin/parametres/actions";

export function LogoUpload({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Format non supporté. Utilisez PNG ou JPG.");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("logo", file);
    const result = await uploadLogo(fd);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer le logo ?")) return;
    setLoading(true);
    await supprimerLogo();
    setLoading(false);
    router.refresh();
  }

  const displayed = preview ?? currentLogoUrl;

  return (
    <div className="space-y-4">
      {/* Aperçu */}
      {displayed ? (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayed}
            alt="Logo"
            className="h-16 w-auto max-w-[200px] object-contain border border-gray-100 rounded-lg bg-gray-50 p-2"
          />
          {preview && (
            <span className="text-xs text-amber-600 font-medium">Aperçu — pas encore enregistré</span>
          )}
        </div>
      ) : (
        <div className="h-16 w-40 border border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
          <span className="text-xs text-gray-400">Aucun logo</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="cursor-pointer bg-white border border-gray-200 hover:border-slate-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          {currentLogoUrl ? "Remplacer" : "Choisir un fichier"}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>

        {preview && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? "Envoi…" : "Enregistrer"}
          </button>
        )}

        {currentLogoUrl && !preview && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "…" : "Supprimer le logo"}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">PNG recommandé (fond transparent). JPG accepté. 2 Mo max.</p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}
