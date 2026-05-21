"use client";

import { useState } from "react";
import { creerAccesClient, regenererMotDePasse } from "@/app/admin/sos-ordi/actions";
import { KeyRound, CheckCircle, RefreshCw, Copy, Check } from "lucide-react";

interface Props {
  clientId: string;
  email: string;
  authUserId: string | null;
}

function PasswordCard({ password, email }: { password: string; email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
      <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
        <CheckCircle size={15} />
        Mot de passe généré
      </p>
      <p className="text-sm text-green-700">
        Communiquez ce mot de passe au client. Il ne sera plus affiché ensuite.
      </p>
      <div className="flex items-center gap-2">
        <p className="flex-1 font-mono text-xl font-bold text-green-900 bg-white border border-green-200 rounded-lg px-4 py-3 tracking-widest text-center select-all">
          {password}
        </p>
        <button
          type="button"
          onClick={copy}
          className="p-3 bg-white border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors shrink-0"
          title="Copier le mot de passe"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <p className="text-xs text-green-600">
        Connexion : <span className="font-medium">{email}</span>
      </p>
    </div>
  );
}

export function CreateAccessButton({ clientId, email, authUserId }: Props) {
  const [createState, setCreateState] = useState<{ password?: string; error?: string } | null>(null);
  const [createPending, setCreatePending] = useState(false);
  const [regenState, setRegenState] = useState<{ password?: string; error?: string } | null>(null);
  const [regenPending, setRegenPending] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setCreatePending(true);
    setCreateState(null);
    const result = await creerAccesClient(null, fd);
    setCreateState(result);
    setCreatePending(false);
  }

  async function handleRegen(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setRegenPending(true);
    setRegenState(null);
    const result = await regenererMotDePasse(null, fd);
    setRegenState(result);
    setRegenPending(false);
  }

  // Accès existant
  if (authUserId && !createState?.password) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle size={15} />
          <span>
            Accès actif — connexion avec{" "}
            <span className="font-medium text-green-700">{email}</span>
          </span>
        </div>

        {regenState?.password ? (
          <PasswordCard password={regenState.password} email={email} />
        ) : (
          <>
            {regenState?.error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {regenState.error}
              </p>
            )}
            <form onSubmit={handleRegen}>
              <input type="hidden" name="client_id" value={clientId} />
              <input type="hidden" name="auth_user_id" value={authUserId} />
              <button
                type="submit"
                disabled={regenPending}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} />
                {regenPending ? "Génération…" : "Régénérer le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // Mot de passe affiché après création
  if (createState?.password) {
    return <PasswordCard password={createState.password} email={email} />;
  }

  // Aucun accès
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">Aucun accès espace client.</p>
      {createState?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{createState.error}</p>
      )}
      <form onSubmit={handleCreate}>
        <input type="hidden" name="client_id" value={clientId} />
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={createPending}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <KeyRound size={14} />
          {createPending ? "Création en cours…" : "Créer l'accès espace client"}
        </button>
      </form>
      <p className="text-xs text-gray-400">
        Un mot de passe temporaire sera généré. Vous le communiquerez au client par téléphone.
      </p>
    </div>
  );
}
