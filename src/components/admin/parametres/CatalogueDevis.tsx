"use client";

import { useState } from "react";
import {
  ajouterCatalogueItem,
  modifierCatalogueItem,
  toggleCatalogueItem,
  monterCatalogueItem,
  descendreCatalogueItem,
} from "@/app/admin/parametres/catalogue-actions";

type Item = {
  id: string;
  libelle: string;
  description: string | null;
  prix_ht: number;
  categorie: string;
  ordre: number;
  actif: boolean;
};

const CAT_LABELS: Record<string, string> = {
  base: "Base",
  module: "Module",
  connexion: "Connexion",
  autre: "Autre",
};

const CAT_COLORS: Record<string, string> = {
  base: "bg-orange-100 text-orange-700",
  module: "bg-blue-100 text-blue-700",
  connexion: "bg-purple-100 text-purple-700",
  autre: "bg-gray-100 text-gray-600",
};

function prix(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " €";
}

type FormMode = { type: "add" } | { type: "edit"; item: Item } | null;

export function CatalogueDevis({ items: initial }: { items: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [mode, setMode] = useState<FormMode>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    try {
      if (mode?.type === "add") {
        await ajouterCatalogueItem(fd);
        // Optimistic: reload via revalidation will update on next navigation
        // For immediate feedback, add locally
        setMode(null);
      } else if (mode?.type === "edit") {
        await modifierCatalogueItem(mode.item.id, fd);
        setMode(null);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: Item) {
    const updated = items.map((i) =>
      i.id === item.id ? { ...i, actif: !i.actif } : i
    );
    setItems(updated);
    await toggleCatalogueItem(item.id, !item.actif);
  }

  async function handleMonter(item: Item) {
    await monterCatalogueItem(item.id, item.ordre);
    // Reorder locally
    const sorted = [...items].sort((a, b) => a.ordre - b.ordre);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    const newItems = items.map((i) => {
      if (i.id === item.id) return { ...i, ordre: prev.ordre };
      if (i.id === prev.id) return { ...i, ordre: item.ordre };
      return i;
    });
    setItems(newItems);
  }

  async function handleDescendre(item: Item) {
    await descendreCatalogueItem(item.id, item.ordre);
    const sorted = [...items].sort((a, b) => a.ordre - b.ordre);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    const newItems = items.map((i) => {
      if (i.id === item.id) return { ...i, ordre: next.ordre };
      if (i.id === next.id) return { ...i, ordre: item.ordre };
      return i;
    });
    setItems(newItems);
  }

  const sorted = [...items].sort((a, b) => a.ordre - b.ordre);

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-6">#</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500">Libellé</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500">Catégorie</th>
              <th className="text-right py-2 pr-3 text-xs font-medium text-gray-500">Prix HT</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500">État</th>
              <th className="py-2 text-xs font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-gray-50 ${!item.actif ? "opacity-40" : ""}`}
              >
                <td className="py-2 pr-3 text-gray-400 text-xs">{item.ordre}</td>
                <td className="py-2 pr-3">
                  <div className="font-medium text-gray-800">{item.libelle}</div>
                  {item.description && (
                    <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[item.categorie] ?? CAT_COLORS.autre}`}>
                    {CAT_LABELS[item.categorie] ?? item.categorie}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right font-mono text-gray-700">{prix(item.prix_ht)}</td>
                <td className="py-2 pr-3">
                  <span className={`text-xs ${item.actif ? "text-green-600" : "text-gray-400"}`}>
                    {item.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleMonter(item)}
                      title="Monter"
                      className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleDescendre(item)}
                      title="Descendre"
                      className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => setMode({ type: "edit", item })}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded hover:border-gray-400 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleToggle(item)}
                      className={`px-2 py-1 text-xs border rounded transition-colors ${
                        item.actif
                          ? "text-orange-600 border-orange-200 hover:border-orange-400"
                          : "text-green-600 border-green-200 hover:border-green-400"
                      }`}
                    >
                      {item.actif ? "Désactiver" : "Activer"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bouton ajouter */}
      {mode === null && (
        <button
          onClick={() => setMode({ type: "add" })}
          className="mt-4 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
        >
          <span className="text-lg leading-none">+</span> Ajouter un élément
        </button>
      )}

      {/* Formulaire inline */}
      {mode !== null && (
        <form onSubmit={handleSubmit} className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            {mode.type === "add" ? "Nouvel élément" : "Modifier l'élément"}
          </p>
          {err && <p className="text-xs text-red-600">{err}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Libellé *</label>
              <input
                name="libelle"
                required
                defaultValue={mode.type === "edit" ? mode.item.libelle : ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                name="description"
                defaultValue={mode.type === "edit" ? (mode.item.description ?? "") : ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prix HT (€) *</label>
              <input
                name="prix_ht"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={mode.type === "edit" ? mode.item.prix_ht : ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie *</label>
              <select
                name="categorie"
                defaultValue={mode.type === "edit" ? mode.item.categorie : "module"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="base">Base</option>
                <option value="module">Module</option>
                <option value="connexion">Connexion</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
              <input
                name="ordre"
                type="number"
                defaultValue={mode.type === "edit" ? mode.item.ordre : 999}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "Enregistrement…" : mode.type === "add" ? "Ajouter" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => { setMode(null); setErr(null); }}
              className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 border border-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
