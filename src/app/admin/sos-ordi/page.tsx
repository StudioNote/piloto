import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import Link from "next/link";

export default async function SosOrdiPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("piloto_clients")
    .select("id, nom, prenom, telephone, adresse")
    .order("nom");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: "SOS Ordi" }]}
      />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
        <Link
          href="/admin/sos-ordi/nouveau"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau client
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {!clients || clients.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">
            Aucun client enregistré.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Nom</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Prénom</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Téléphone</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Adresse</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800">{client.nom}</td>
                  <td className="px-5 py-4 text-gray-600">{client.prenom}</td>
                  <td className="px-5 py-4 text-gray-500">{client.telephone ?? "—"}</td>
                  <td className="px-5 py-4 text-gray-500 max-w-xs truncate">
                    {client.adresse ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/sos-ordi/${client.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/admin/sos-ordi/${client.id}/modifier`}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
