"use client";

import { useState } from "react";
import { creerRemplacement } from "@/app/admin/radio/remplacements/actions";

interface Radio {
  id: string;
  nom_radio: string;
  tranche_debut: string;
  tranche_fin: string;
  tarif_horaire: number | string;
}

function calcDays(debut: string, fin: string): number {
  if (!debut || !fin) return 0;
  const d1 = new Date(debut).getTime();
  const d2 = new Date(fin).getTime();
  return Math.max(0, Math.floor((d2 - d1) / 86400000) + 1);
}

function calcHours(debut: string, fin: string): number {
  if (!debut || !fin) return 0;
  const [h1, m1] = debut.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  return Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
}

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export function NouveauRemplacementForm({ radios }: { radios: Radio[] }) {
  const [mode, setMode] = useState<"existante" | "ponctuelle">("existante");
  const [selectedId, setSelectedId] = useState(radios[0]?.id ?? "");
  const [nomRadio, setNomRadio] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [trancheDebut, setTrancheDebut] = useState(
    radios[0]?.tranche_debut.slice(0, 5) ?? ""
  );
  const [trancheFin, setTrancheFin] = useState(
    radios[0]?.tranche_fin.slice(0, 5) ?? ""
  );
  const [tarif, setTarif] = useState(
    radios[0] ? String(Number(radios[0].tarif_horaire)) : ""
  );

  function handleRadioSelect(id: string) {
    setSelectedId(id);
    const r = radios.find((x) => x.id === id);
    if (r) {
      setTrancheDebut(r.tranche_debut.slice(0, 5));
      setTrancheFin(r.tranche_fin.slice(0, 5));
      setTarif(String(Number(r.tarif_horaire)));
    }
  }

  function handleModeChange(m: "existante" | "ponctuelle") {
    setMode(m);
    if (m === "existante" && radios.length > 0) {
      handleRadioSelect(selectedId || radios[0].id);
    } else {
      setTrancheDebut("");
      setTrancheFin("");
      setTarif("");
    }
  }

  const effectiveNomRadio =
    mode === "existante"
      ? (radios.find((r) => r.id === selectedId)?.nom_radio ?? "")
      : nomRadio;

  const days = calcDays(dateDebut, dateFin);
  const hours = calcHours(trancheDebut, trancheFin);
  const tarifNum = parseFloat(tarif) || 0;
  const amount = days * hours * tarifNum;
  const showPreview = days > 0 && hours > 0 && tarifNum > 0;

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form action={creerRemplacement} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
      {/* Champs cachés */}
      <input type="hidden" name="radio_id" value={mode === "existante" ? selectedId : ""} onChange={() => {}} />
      <input type="hidden" name="nom_radio" value={effectiveNomRadio} onChange={() => {}} />

      {/* Mode */}
      <div>
        <p className={labelCls}>Type de radio</p>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {(["existante", "ponctuelle"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "existante" ? "Radio enregistrée" : "Radio ponctuelle"}
            </button>
          ))}
        </div>
      </div>

      {/* Sélection radio */}
      {mode === "existante" ? (
        <div>
          <label htmlFor="radio_select" className={labelCls}>
            Radio <span className="text-red-500">*</span>
          </label>
          {radios.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucune radio enregistrée.{" "}
              <a href="/admin/radio/nouveau" className="text-blue-600 hover:underline">
                Créer une fiche radio
              </a>
            </p>
          ) : (
            <select
              id="radio_select"
              value={selectedId}
              onChange={(e) => handleRadioSelect(e.target.value)}
              className={inputCls}
            >
              {radios.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nom_radio}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="nom_radio_input" className={labelCls}>
            Nom de la radio <span className="text-red-500">*</span>
          </label>
          <input
            id="nom_radio_input"
            type="text"
            required={mode === "ponctuelle"}
            value={nomRadio}
            onChange={(e) => setNomRadio(e.target.value)}
            placeholder="ex: Radio Locale FM"
            className={inputCls}
          />
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date_debut" className={labelCls}>
            Date début <span className="text-red-500">*</span>
          </label>
          <input
            id="date_debut"
            name="date_debut"
            type="date"
            required
            value={dateDebut}
            onChange={(e) => {
              setDateDebut(e.target.value);
              if (dateFin && e.target.value > dateFin) setDateFin(e.target.value);
            }}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="date_fin" className={labelCls}>
            Date fin <span className="text-red-500">*</span>
          </label>
          <input
            id="date_fin"
            name="date_fin"
            type="date"
            required
            min={dateDebut}
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Tranche + tarif */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="tranche_debut" className={labelCls}>
            Début de tranche <span className="text-red-500">*</span>
          </label>
          <input
            id="tranche_debut"
            name="tranche_debut"
            type="time"
            required
            value={trancheDebut}
            onChange={(e) => setTrancheDebut(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="tranche_fin" className={labelCls}>
            Fin de tranche <span className="text-red-500">*</span>
          </label>
          <input
            id="tranche_fin"
            name="tranche_fin"
            type="time"
            required
            value={trancheFin}
            onChange={(e) => setTrancheFin(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="tarif_horaire" className={labelCls}>
            Tarif horaire (€) <span className="text-red-500">*</span>
          </label>
          <input
            id="tarif_horaire"
            name="tarif_horaire"
            type="number"
            required
            step="0.01"
            min="0"
            value={tarif}
            onChange={(e) => setTarif(e.target.value)}
            placeholder="0"
            className={inputCls}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelCls}>Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Informations complémentaires…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Estimation */}
      {showPreview && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
          <p className="text-blue-400 text-xs uppercase tracking-wide mb-1.5">Estimation</p>
          <p className="text-blue-800 font-medium">
            {days} jour{days > 1 ? "s" : ""} × {hours}h × {tarifNum} €/h
            {" = "}
            <span className="text-lg font-bold">{eur(amount)}</span>
          </p>
          <p className="text-blue-400 text-xs mt-1">
            Toutes les journées entre les deux dates sont comptées.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Enregistrer
        </button>
        <a
          href="/admin/radio/remplacements"
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 transition-colors"
        >
          Annuler
        </a>
      </div>
    </form>
  );
}
