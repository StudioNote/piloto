import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { modifierRadio } from "../../actions";
import { notFound } from "next/navigation";

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

export default async function ModifierRadioPage({ params }: { params: { id: string } }) {
  const db = await getDb();
  const { data: radio } = await db
    .from("piloto_radios")
    .select("id, nom_radio, nom_contact, telephone")
    .eq("id", params.id)
    .single();

  if (!radio) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Radio", href: "/admin/radio" },
          { label: radio.nom_radio, href: `/admin/radio/${radio.id}` },
          { label: "Modifier" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier la radio</h2>

      <form action={modifierRadio} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <input type="hidden" name="id" value={radio.id} />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nom de la radio" name="nom_radio" required defaultValue={radio.nom_radio} />
          </div>
          <Field label="Nom du contact" name="nom_contact" defaultValue={radio.nom_contact ?? ""} />
          <Field label="Téléphone" name="telephone" type="tel" defaultValue={radio.telephone ?? ""} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Enregistrer
          </button>
          <a
            href={`/admin/radio/${radio.id}`}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
