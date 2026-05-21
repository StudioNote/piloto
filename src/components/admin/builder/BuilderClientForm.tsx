"use client";

import { useState } from "react";

interface DefaultValues {
  id?: string;
  societe?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  defaultValues?: DefaultValues;
}

const inputCls =
  "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="ml-1 text-xs font-normal text-gray-400">{hint}</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className={inputCls}
      />
    </div>
  );
}

export function BuilderClientForm({ action, cancelHref, defaultValues = {} }: Props) {
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const societe = (form.elements.namedItem("societe") as HTMLInputElement).value.trim();
    const nom = (form.elements.namedItem("nom") as HTMLInputElement).value.trim();
    if (!societe && !nom) {
      e.preventDefault();
      setError("Renseignez au moins la société ou le nom du contact.");
    } else {
      setError("");
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 p-6 space-y-5"
    >
      {defaultValues.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <Field
        label="Société"
        name="societe"
        defaultValue={defaultValues.societe ?? ""}
        hint="(optionnel)"
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Nom"
          name="nom"
          defaultValue={defaultValues.nom ?? ""}
          hint="(optionnel)"
        />
        <Field
          label="Prénom"
          name="prenom"
          defaultValue={defaultValues.prenom ?? ""}
          hint="(optionnel)"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="border-t border-gray-100 pt-4 space-y-4">
        <Field
          label="Email"
          name="email"
          type="email"
          defaultValue={defaultValues.email ?? ""}
        />
        <Field
          label="Téléphone"
          name="telephone"
          type="tel"
          defaultValue={defaultValues.telephone ?? ""}
        />
        <Field
          label="Adresse"
          name="adresse"
          defaultValue={defaultValues.adresse ?? ""}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Enregistrer
        </button>
        <a
          href={cancelHref}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 transition-colors"
        >
          Annuler
        </a>
      </div>
    </form>
  );
}
