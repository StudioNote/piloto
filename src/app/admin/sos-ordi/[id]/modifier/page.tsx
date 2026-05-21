import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { modifierClient } from "../../actions";
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

export default async function ModifierClientPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("piloto_clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!client) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "SOS Ordi", href: "/admin/sos-ordi" },
          {
            label: [client.civilite, client.prenom, client.nom].filter(Boolean).join(" "),
            href: `/admin/sos-ordi/${client.id}`,
          },
          { label: "Modifier" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le client</h2>
      <form
        action={modifierClient}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-5"
      >
        <input type="hidden" name="id" value={client.id} />
        <div>
          <label htmlFor="civilite" className="block text-sm font-medium text-gray-700 mb-1.5">
            Civilité
          </label>
          <select
            id="civilite"
            name="civilite"
            defaultValue={client.civilite ?? ""}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">—</option>
            <option value="M.">M.</option>
            <option value="Mme">Mme</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom" name="nom" required defaultValue={client.nom} />
          <Field label="Prénom" name="prenom" required defaultValue={client.prenom} />
        </div>
        <Field
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={client.email}
        />
        <Field
          label="Téléphone"
          name="telephone"
          type="tel"
          defaultValue={client.telephone ?? ""}
        />
        <Field
          label="Adresse complète"
          name="adresse"
          defaultValue={client.adresse ?? ""}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Enregistrer
          </button>
          <a
            href={`/admin/sos-ordi/${client.id}`}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
