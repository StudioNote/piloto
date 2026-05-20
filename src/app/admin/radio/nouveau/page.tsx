import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { creerRadio } from "../actions";

const JOURS = [
  { value: "lundi", label: "Lundi" },
  { value: "mardi", label: "Mardi" },
  { value: "mercredi", label: "Mercredi" },
  { value: "jeudi", label: "Jeudi" },
  { value: "vendredi", label: "Vendredi" },
  { value: "samedi", label: "Samedi" },
  { value: "dimanche", label: "Dimanche" },
];

function Field({
  label,
  name,
  type = "text",
  required = false,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        step={step}
        min={min}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

export default function NouvelleRadioPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Radio", href: "/admin/radio" },
          { label: "Nouvelle radio" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle radio</h2>

      <form action={creerRadio} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nom de la radio" name="nom_radio" required />
          </div>
          <Field label="Nom du contact" name="nom_contact" />
          <Field label="Téléphone" name="telephone" type="tel" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Début de tranche" name="tranche_debut" type="time" required />
          <Field label="Fin de tranche" name="tranche_fin" type="time" required />
          <Field label="Tarif horaire (€)" name="tarif_horaire" type="number" required step="0.01" min="0" />
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-3">
            Jours travaillés <span className="text-red-500">*</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {JOURS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="jours_travailles"
                  value={value}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Enregistrer
          </button>
          <a
            href="/admin/radio"
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
