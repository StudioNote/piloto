import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { creerRadio } from "../actions";

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Nouvelle radio</h2>
      <p className="text-sm text-gray-400 mb-6">
        Les tranches horaires se configurent dans la fiche radio après création.
      </p>

      <form action={creerRadio} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nom de la radio" name="nom_radio" required />
          </div>
          <Field label="Nom du contact" name="nom_contact" />
          <Field label="Téléphone" name="telephone" type="tel" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Créer la radio
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
