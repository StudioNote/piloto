"use client";

import { useActionState } from "react";
import { creerAccesClient } from "@/app/admin/sos-ordi/actions";
import { KeyRound, CheckCircle } from "lucide-react";

interface Props {
  clientId: string;
  email: string;
  hasAccess: boolean;
}

export function CreateAccessButton({ clientId, email, hasAccess }: Props) {
  const [state, action, pending] = useActionState(creerAccesClient, null);

  if (hasAccess && !state?.password) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle size={15} />
        Accès espace client actif
      </div>
    );
  }

  if (state?.password) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-2">
        <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
          <CheckCircle size={15} />
          Accès créé avec succès
        </p>
        <p className="text-sm text-green-700">
          Communiquez ce mot de passe temporaire au client :
        </p>
        <p className="font-mono text-xl font-bold text-green-900 bg-white border border-green-200 rounded-lg px-4 py-3 tracking-widest text-center select-all">
          {state.password}
        </p>
        <p className="text-xs text-green-600">
          Le client se connecte sur l&apos;espace client avec son email ({email}) et ce mot de passe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      <form action={action}>
        <input type="hidden" name="client_id" value={clientId} />
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <KeyRound size={14} />
          {pending ? "Création en cours…" : "Créer l'accès espace client"}
        </button>
      </form>
      <p className="text-xs text-gray-400">
        Un mot de passe temporaire sera généré. Vous le communiquerez au client par téléphone.
      </p>
    </div>
  );
}
