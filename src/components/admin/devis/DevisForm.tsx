"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { creerDevis, mettreAJourDevis } from "@/app/admin/devis/actions";
import Link from "next/link";

type CatalogueItem = {
  id: string;
  libelle: string;
  description: string | null;
  prix_ht: number;
  categorie: string;
};

type Prospect = {
  id: string;
  societe: string | null;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
};

type BuilderClient = {
  id: string;
  societe: string | null;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
};

type LigneState = {
  _key: string;
  catalogue_id: string | null;
  libelle: string;
  description: string;
  quantite: number;
  prix_unitaire_ht: number;
  total_ligne: number;
};

type DevisData = {
  id: string;
  numero: string;
  date_emission: string;
  date_validite: string;
  client_nom: string | null;
  client_adresse: string | null;
  client_cp_ville: string | null;
  client_tel: string | null;
  client_email: string | null;
  objet: string | null;
  statut: string;
  remise_libelle: string | null;
  remise_montant: number;
  notes: string | null;
  prospect_id: string | null;
  builder_client_id: string | null;
  piloto_devis_lignes?: Array<{
    id: string;
    catalogue_id: string | null;
    libelle: string;
    description: string | null;
    quantite: number;
    prix_unitaire_ht: number;
    total_ligne: number;
    ordre: number;
  }>;
};

const CAT_COLORS: Record<string, string> = {
  base: "bg-orange-100 text-orange-700",
  module: "bg-blue-100 text-blue-700",
  connexion: "bg-purple-100 text-purple-700",
  autre: "bg-gray-100 text-gray-600",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function genKey() {
  return Math.random().toString(36).slice(2);
}

function nomContact(c: Prospect | BuilderClient) {
  return [c.societe, c.nom, c.prenom].filter(Boolean).join(" — ").trim() || c.email || "—";
}

export function DevisForm({
  catalogue,
  prospects,
  builderClients,
  devis: initial,
}: {
  catalogue: CatalogueItem[];
  prospects: Prospect[];
  builderClients: BuilderClient[];
  devis?: DevisData;
}) {
  const router = useRouter();
  const isEdit = !!initial;

  const today = dateISO(new Date());
  const plusTrente = dateISO(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  // Client
  const [clientNom, setClientNom] = useState(initial?.client_nom ?? "");
  const [clientAdresse, setClientAdresse] = useState(initial?.client_adresse ?? "");
  const [clientCpVille, setClientCpVille] = useState(initial?.client_cp_ville ?? "");
  const [clientTel, setClientTel] = useState(initial?.client_tel ?? "");
  const [clientEmail, setClientEmail] = useState(initial?.client_email ?? "");
  const [prospectId, setProspectId] = useState(initial?.prospect_id ?? "");
  const [builderClientId, setBuilderClientId] = useState(initial?.builder_client_id ?? "");

  // Lignes
  const [lignes, setLignes] = useState<LigneState[]>(() => {
    if (initial?.piloto_devis_lignes) {
      return [...initial.piloto_devis_lignes]
        .sort((a, b) => a.ordre - b.ordre)
        .map((l) => ({
          _key: genKey(),
          catalogue_id: l.catalogue_id,
          libelle: l.libelle,
          description: l.description ?? "",
          quantite: Number(l.quantite),
          prix_unitaire_ht: Number(l.prix_unitaire_ht),
          total_ligne: Number(l.total_ligne),
        }));
    }
    return [];
  });

  // Remise
  const [avecRemise, setAvecRemise] = useState(
    !!(initial?.remise_montant && initial.remise_montant > 0)
  );
  const [remiseMontant, setRemiseMontant] = useState(initial?.remise_montant ?? 0);

  // Modals
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [searchCat, setSearchCat] = useState("");
  const [searchContact, setSearchContact] = useState("");

  // Saving
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Totaux
  const totalLignes = lignes.reduce((s, l) => s + l.total_ligne, 0);
  const totalHT = Math.max(0, totalLignes - remiseMontant);

  // ── Lignes handlers ──────────────────────────────────────

  function ajouterDepuisCatalogue(item: CatalogueItem) {
    setLignes((prev) => [
      ...prev,
      {
        _key: genKey(),
        catalogue_id: item.id,
        libelle: item.libelle,
        description: item.description ?? "",
        quantite: 1,
        prix_unitaire_ht: item.prix_ht,
        total_ligne: item.prix_ht,
      },
    ]);
    setShowCatalogue(false);
    setSearchCat("");
  }

  function ajouterLigneLibre() {
    setLignes((prev) => [
      ...prev,
      {
        _key: genKey(),
        catalogue_id: null,
        libelle: "",
        description: "",
        quantite: 1,
        prix_unitaire_ht: 0,
        total_ligne: 0,
      },
    ]);
  }

  function supprimerLigne(key: string) {
    setLignes((prev) => prev.filter((l) => l._key !== key));
  }

  function updateLigne(key: string, field: keyof LigneState, value: string | number) {
    setLignes((prev) =>
      prev.map((l) => {
        if (l._key !== key) return l;
        const updated = { ...l, [field]: value };
        if (field === "quantite" || field === "prix_unitaire_ht") {
          updated.total_ligne =
            Number(field === "quantite" ? value : updated.quantite) *
            Number(field === "prix_unitaire_ht" ? value : updated.prix_unitaire_ht);
        }
        return updated;
      })
    );
  }

  // ── Contact préchargé ────────────────────────────────────

  function remplirDepuisContact(c: Prospect | BuilderClient, type: "prospect" | "client") {
    const nom = [c.societe, c.nom && c.prenom ? `${c.nom} ${c.prenom}` : (c.nom ?? c.prenom)].filter(Boolean).join(" — ");
    setClientNom(nom);
    setClientEmail(c.email ?? "");
    setClientTel(c.telephone ?? "");
    setClientAdresse(c.adresse ?? "");
    setClientCpVille("");
    if (type === "prospect") {
      setProspectId(c.id);
      setBuilderClientId("");
    } else {
      setBuilderClientId(c.id);
      setProspectId("");
    }
    setShowContacts(false);
    setSearchContact("");
  }

  // ── Soumission ───────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("lignes_json", JSON.stringify(
      lignes.map((l, i) => ({ ...l, ordre: i, _key: undefined }))
    ));
    fd.set("remise_montant", avecRemise ? String(remiseMontant) : "0");
    fd.set("prospect_id", prospectId);
    fd.set("builder_client_id", builderClientId);

    if (isEdit && initial) {
      const res = await mettreAJourDevis(initial.id, fd);
      if (res.error) {
        setError(res.error);
        setSaving(false);
        return;
      }
      router.push("/admin/devis");
    } else {
      const res = await creerDevis(fd);
      if (res.error) {
        setError(res.error);
        setSaving(false);
        return;
      }
      router.push("/admin/devis");
    }
  }

  // ── Catalogue modal content ──────────────────────────────
  const catFiltered = catalogue.filter((item) => {
    const q = searchCat.toLowerCase();
    return !q || item.libelle.toLowerCase().includes(q) || (item.description ?? "").toLowerCase().includes(q);
  });
  const catGroups = ["base", "module", "connexion", "autre"] as const;

  // ── Contacts modal content ───────────────────────────────
  const allContacts = [
    ...prospects.map((p) => ({ ...p, _type: "prospect" as const })),
    ...builderClients.map((c) => ({ ...c, _type: "client" as const })),
  ].filter((c) => {
    const q = searchContact.toLowerCase();
    return (
      !q ||
      (c.societe ?? "").toLowerCase().includes(q) ||
      (c.nom ?? "").toLowerCase().includes(q) ||
      (c.prenom ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Ligne supérieure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Bloc client */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Client / Destinataire</h2>
              <button
                type="button"
                onClick={() => setShowContacts(true)}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium transition-colors"
              >
                Reprendre un contact →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom / Société</label>
                <input
                  name="client_nom"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Adresse</label>
                <input
                  name="client_adresse"
                  value={clientAdresse}
                  onChange={(e) => setClientAdresse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CP / Ville</label>
                <input
                  name="client_cp_ville"
                  value={clientCpVille}
                  onChange={(e) => setClientCpVille(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                <input
                  name="client_tel"
                  value={clientTel}
                  onChange={(e) => setClientTel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  name="client_email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Bloc infos devis */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Informations</h2>
            {isEdit && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Numéro</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono text-orange-700 font-medium">
                  {initial.numero}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date d&apos;émission</label>
              <input
                name="date_emission"
                type="date"
                defaultValue={initial?.date_emission ?? today}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date de validité</label>
              <input
                name="date_validite"
                type="date"
                defaultValue={initial?.date_validite ?? plusTrente}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            {isEdit && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
                <select
                  name="statut"
                  defaultValue={initial.statut}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="envoye">Envoyé</option>
                  <option value="accepte">Accepté</option>
                  <option value="refuse">Refusé</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Objet */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Objet du devis</label>
          <input
            name="objet"
            defaultValue={initial?.objet ?? ""}
            placeholder="ex. Création d'un outil de gestion sur mesure — Artisans Bouchard"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Lignes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Lignes du devis</h2>

          {lignes.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">Aucune ligne. Ajoutez depuis le catalogue ou une ligne libre.</p>
          ) : (
            <div className="mb-4 space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_80px_100px_100px_24px] gap-2 text-xs font-medium text-gray-500 px-1">
                <span>Désignation</span>
                <span className="text-right">Qté</span>
                <span className="text-right">Prix U. HT</span>
                <span className="text-right">Total HT</span>
                <span></span>
              </div>

              {lignes.map((l) => (
                <div key={l._key} className="grid grid-cols-[1fr_80px_100px_100px_24px] gap-2 items-start group">
                  <div>
                    <input
                      value={l.libelle}
                      onChange={(e) => updateLigne(l._key, "libelle", e.target.value)}
                      placeholder="Désignation *"
                      required
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                    <input
                      value={l.description}
                      onChange={(e) => updateLigne(l._key, "description", e.target.value)}
                      placeholder="Description (optionnelle)"
                      className="w-full px-2 py-1 border-0 text-xs text-gray-400 placeholder:text-gray-300 focus:outline-none mt-0.5"
                    />
                  </div>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={l.quantite}
                    onChange={(e) => updateLigne(l._key, "quantite", parseFloat(e.target.value) || 0)}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={l.prix_unitaire_ht}
                    onChange={(e) => updateLigne(l._key, "prix_unitaire_ht", parseFloat(e.target.value) || 0)}
                    className="px-2 py-1.5 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  <div className="px-2 py-1.5 text-sm text-right font-mono text-gray-700">
                    {fmt(l.total_ligne)}
                  </div>
                  <button
                    type="button"
                    onClick={() => supprimerLigne(l._key)}
                    className="mt-1.5 text-gray-300 hover:text-red-500 transition-colors text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowCatalogue(true)}
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              <span className="text-base leading-none">+</span> Depuis le catalogue
            </button>
            <button
              type="button"
              onClick={ajouterLigneLibre}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              <span className="text-base leading-none">+</span> Ligne libre
            </button>
          </div>

          {/* Totaux */}
          <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-end items-center gap-8 text-sm text-gray-600">
              <span>Total lignes HT</span>
              <span className="font-mono w-28 text-right">{fmt(totalLignes)} €</span>
            </div>

            {/* Remise */}
            <div className="flex justify-end items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avecRemise}
                  onChange={(e) => { setAvecRemise(e.target.checked); if (!e.target.checked) setRemiseMontant(0); }}
                  className="accent-orange-500"
                />
                Remise
              </label>
              {avecRemise && (
                <>
                  <input
                    name="remise_libelle"
                    placeholder="Libellé de la remise"
                    defaultValue={initial?.remise_libelle ?? ""}
                    className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 w-40"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={remiseMontant}
                    onChange={(e) => setRemiseMontant(parseFloat(e.target.value) || 0)}
                    className="px-2 py-1 border border-gray-200 rounded text-sm text-right font-mono focus:outline-none focus:ring-1 focus:ring-orange-400 w-28"
                  />
                  <span className="text-sm text-gray-500 w-4">€</span>
                </>
              )}
            </div>

            <div className="flex justify-end items-center gap-8 border-t border-gray-200 pt-3">
              <span className="text-base font-bold text-gray-800">Net à payer HT</span>
              <span className="font-mono font-bold text-orange-700 text-lg w-28 text-right">{fmt(totalHT)} €</span>
            </div>
            <div className="flex justify-end">
              <span className="text-xs text-gray-400">TVA non applicable, art. 293 B du CGI</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2">Notes internes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            placeholder="Notes visibles uniquement en back-office (relances, contexte…)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {/* Actions */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
        )}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le devis"}
          </button>
          <Link href="/admin/devis" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Annuler
          </Link>
          {isEdit && (
            <Link
              href={`/api/devis/${initial.id}/pdf`}
              target="_blank"
              className="ml-auto text-sm text-orange-600 hover:text-orange-800 font-medium border border-orange-200 rounded-lg px-4 py-2.5 transition-colors"
            >
              Télécharger le PDF
            </Link>
          )}
        </div>
      </form>

      {/* Modal catalogue */}
      {showCatalogue && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => { setShowCatalogue(false); setSearchCat(""); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Choisir depuis le catalogue</h3>
              <input
                autoFocus
                type="search"
                placeholder="Rechercher…"
                value={searchCat}
                onChange={(e) => setSearchCat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {catGroups.map((cat) => {
                const items = catFiltered.filter((i) => i.categorie === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="mb-2">
                    <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg mb-1 ${CAT_COLORS[cat]}`}>
                      {cat === "base" ? "Base" : cat === "module" ? "Modules" : cat === "connexion" ? "Connexions" : "Autres"}
                    </div>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => ajouterDepuisCatalogue(item)}
                        className="w-full text-left px-3 py-2.5 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-800">{item.libelle}</span>
                          <span className="text-sm font-mono text-orange-700 ml-3">{item.prix_ht.toLocaleString("fr-FR")} €</span>
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}
              {catFiltered.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">Aucun résultat.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal contacts */}
      {showContacts && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => { setShowContacts(false); setSearchContact(""); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Reprendre un contact</h3>
              <input
                autoFocus
                type="search"
                placeholder="Nom, société, email…"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {allContacts.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Aucun résultat.</p>
              ) : (
                allContacts.map((c) => (
                  <button
                    key={c.id + c._type}
                    type="button"
                    onClick={() => remplirDepuisContact(c, c._type)}
                    className="w-full text-left px-3 py-2.5 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c._type === "prospect" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
                        {c._type === "prospect" ? "Prospect" : "Client"}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{nomContact(c)}</span>
                    </div>
                    {c.email && <div className="text-xs text-gray-400 mt-0.5 ml-8">{c.email}</div>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
